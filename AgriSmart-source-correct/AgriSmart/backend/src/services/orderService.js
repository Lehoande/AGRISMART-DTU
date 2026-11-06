const pool = require('../db');
const AppError = require('../lib/AppError');
const { canTransition, STATUS_VI } = require('./orderStatus');
const { notifyUser, notifyLowStock } = require('./notificationService');
const { sendMail } = require('./mailer');

async function getCheckoutReplay(userId, idempotencyKey) {
  const [[order]] = await pool.query(`SELECT o.id,
    (SELECT COALESCE(SUM(oi.unit_price * oi.quantity),0) FROM order_items oi WHERE oi.order_id=o.id) AS subtotal,
    o.discount_code,o.discount_amount,o.shipping_fee,o.total,o.status,o.payment_status
    FROM checkout_idempotency ci JOIN orders o ON o.id=ci.order_id
    WHERE ci.user_id=? AND ci.idempotency_key=?`, [userId, idempotencyKey]);
  return order ? {
    id: Number(order.id), subtotal: Number(order.subtotal), discount_code: order.discount_code,
    discount_amount: Number(order.discount_amount), shipping_fee: Number(order.shipping_fee),
    total: Number(order.total), status: order.status, payment_status: order.payment_status,
    idempotent_replay: true,
  } : null;
}

const vnd = (n) => `${Number(n).toLocaleString('vi-VN')}đ`;

function initialPaymentState(method) {
  if (['cod', 'banking', 'vnpay', 'momo'].includes(method)) return { paymentStatus: 'unpaid', ref: null };
  throw new AppError(400, 'Phương thức thanh toán này chưa được kết nối.');
}

/**
 * CHECKOUT - xử lý rủi ro R1 (race condition tồn kho). Một transaction duy nhất:
 * đọc giỏ -> khoá dòng products theo thứ tự id (FOR UPDATE, tránh deadlock) -> kiểm tra tồn
 * -> xác nhận phương thức và trạng thái thanh toán ban đầu -> tạo order/items -> ghi log -> xoá giỏ -> thông báo.
 */
async function checkout(userId, { shipping_name, shipping_phone, shipping_address, shipping_street_address, shipping_ward, shipping_district, shipping_province, payment_method, promo_code }, idempotencyKey = null) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    if (idempotencyKey) {
      const [[existing]] = await conn.query(`SELECT order_id FROM checkout_idempotency
        WHERE user_id=? AND idempotency_key=? FOR UPDATE`, [userId, idempotencyKey]);
      if (existing?.order_id) {
        const replay = await getCheckoutReplay(userId, idempotencyKey);
        if (!replay) throw new AppError(409, 'Yêu cầu đặt hàng đã được xử lý. Hãy kiểm tra danh sách đơn hàng.');
        await conn.commit();
        return replay;
      }
    }

    const [cart] = await conn.query('SELECT product_id, quantity FROM cart_items WHERE user_id = ? ORDER BY product_id', [userId]);
    if (!cart.length) throw new AppError(400, 'Cart is empty');

    if (idempotencyKey) {
      await conn.query('INSERT INTO checkout_idempotency(user_id,idempotency_key,order_id) VALUES(?,?,NULL)', [userId, idempotencyKey]);
    }

    const ids = cart.map((c) => c.product_id);
    const [products] = await conn.query(
      `SELECT p.id, p.name, p.price, p.stock, p.is_active FROM products p
       WHERE p.id IN (?) AND (p.seller_id IS NULL OR EXISTS (
         SELECT 1 FROM seller_profiles sp WHERE sp.user_id = p.seller_id AND sp.status = 'approved'
       )) ORDER BY p.id FOR UPDATE`, [ids]);
    const byId = new Map(products.map((p) => [p.id, p]));

    const problems = [];
    let total = 0;
    const lines = cart.map((c) => {
      const p = byId.get(c.product_id);
      if (!p || !p.is_active) problems.push({ product_id: c.product_id, reason: 'Sản phẩm không còn kinh doanh' });
      else if (p.stock < c.quantity) {
        problems.push({ product_id: p.id, name: p.name, requested: c.quantity, available: p.stock, reason: 'Không đủ hàng' });
      } else total += p.price * c.quantity;
      return { product: p, quantity: c.quantity };
    });
    if (problems.length) throw new AppError(409, `Insufficient stock for ${problems[0].name || 'một số sản phẩm'}`, problems);

    for (const l of lines) {
      // stock >= qty là lớp bảo vệ thứ 2; CHECK (stock >= 0) ở DB là lớp thứ 3
      const [r] = await conn.query('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
        [l.quantity, l.product.id, l.quantity]);
      if (r.affectedRows !== 1) throw new AppError(409, `Insufficient stock for ${l.product.name}`);
    }

    const shippingFee = total >= 300000 ? 0 : 30000;
    let discountAmount = 0;
    if (promo_code) {
      const [[promotion]] = await conn.query(
        `SELECT code, discount_percent FROM promotions WHERE code = ? AND active = 1
         AND (starts_at IS NULL OR starts_at <= NOW()) AND (ends_at IS NULL OR ends_at >= NOW())
         AND (max_uses IS NULL OR use_count < max_uses) FOR UPDATE`, [promo_code]);
      if (!promotion) throw new AppError(400, 'Mã giảm giá không hợp lệ hoặc đã hết lượt sử dụng');
      discountAmount = Math.round(total * Number(promotion.discount_percent) / 100);
    }
    const grandTotal = Math.max(0, total - discountAmount) + shippingFee;
    const pay = initialPaymentState(payment_method);

    const [o] = await conn.query(
      `INSERT INTO orders (user_id, total, shipping_fee, discount_code, discount_amount, status, shipping_name, shipping_phone, shipping_address, payment_method, payment_status, payment_ref)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [userId, grandTotal, shippingFee, promo_code || null, discountAmount, 'pending', shipping_name, shipping_phone, shipping_address, payment_method, pay.paymentStatus, pay.ref]);
    const orderId = o.insertId;
    if (idempotencyKey) await conn.query('UPDATE checkout_idempotency SET order_id=? WHERE user_id=? AND idempotency_key=?', [orderId, userId, idempotencyKey]);

    await conn.query('INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity) VALUES ?',
      [lines.map((l) => [orderId, l.product.id, l.product.name, l.product.price, l.quantity])]);
    await conn.query('INSERT INTO inventory_logs (product_id, change_qty, stock_after, reason, user_id) VALUES ?',
      [lines.map((l) => [l.product.id, -l.quantity, l.product.stock - l.quantity, `Bán cho đơn #${orderId}`, userId])]);
    await conn.query('INSERT INTO browsing_events (user_id, product_id, event_type) VALUES ?',
      [lines.map((l) => [userId, l.product.id, 'purchase'])]);
    await conn.query('INSERT INTO order_status_history (order_id, from_status, to_status, changed_by) VALUES (?,?,?,?)',
      [orderId, null, 'pending', userId]);
    await conn.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
    if (promo_code) await conn.query('UPDATE promotions SET use_count = use_count + 1 WHERE code = ?', [promo_code]);

    await notifyUser(conn, userId, {
      type: 'order_status', title: 'Đặt hàng thành công',
      message: `Đơn #${orderId} đã được tạo, tổng ${vnd(grandTotal)}.`, orderId,
    });
    await notifyLowStock(conn, ids);

    const [[user]] = await conn.query('SELECT email, name FROM users WHERE id = ?', [userId]);
    // Keep the latest successful checkout details as the buyer's default profile for next time.
    await conn.query('UPDATE users SET name = ?, phone = ?, address = ?, ward = ?, district = ?, province = ? WHERE id = ?',
      [shipping_name, shipping_phone, shipping_street_address || shipping_address, shipping_ward || null, shipping_district || null, shipping_province || null, userId]);
    await conn.commit();

    sendMail({
      to: user.email,
      subject: `AgriSmart - Xác nhận đơn hàng #${orderId}`,
      text: `Xin chào ${user.name},\n\nĐơn #${orderId} đã được ghi nhận.\nTạm tính: ${vnd(total)}\nPhí vận chuyển: ${vnd(shippingFee)}\nTổng tiền: ${vnd(grandTotal)}\nĐịa chỉ giao: ${shipping_address}\n\nCảm ơn bạn đã mua nông sản tại AgriSmart!`,
    });
    return { id: orderId, subtotal: total, discount_code: promo_code || null, discount_amount: discountAmount, shipping_fee: shippingFee, total: grandTotal, status: 'pending', payment_status: pay.paymentStatus };
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY' && idempotencyKey) {
      const replay = await getCheckoutReplay(userId, idempotencyKey);
      if (replay) return replay;
    }
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Đổi trạng thái đơn. actor = { id, role }.
 * Khách chỉ được huỷ đơn của mình khi còn pending. Huỷ => hoàn kho (+ refunded nếu đã paid).
 */
async function updateStatus(orderId, newStatus, actor) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[order]] = await conn.query(
      `SELECT o.*, u.email, u.name AS customer_name,
        (o.created_at <= DATE_SUB(NOW(), INTERVAL 5 MINUTE)) AS payment_expired
       FROM orders o JOIN users u ON u.id = o.user_id WHERE o.id = ? FOR UPDATE`, [orderId]);
    if (!order) throw new AppError(404, 'Không tìm thấy đơn hàng');

    if (actor.role === 'system' && (newStatus !== 'cancelled' || order.payment_method !== 'banking' || order.payment_status !== 'unpaid' || !Number(order.payment_expired))) {
      throw new AppError(409, 'Đơn hàng chưa đến hạn tự hủy hoặc đã được thanh toán');
    }

    if (actor.role === 'customer') {
      if (order.user_id !== actor.id) throw new AppError(403, 'Không phải đơn hàng của bạn');
      if (newStatus !== 'cancelled' || order.status !== 'pending') {
        throw new AppError(409, 'Bạn chỉ có thể huỷ đơn khi đang chờ xác nhận');
      }
    }
    if (actor.role === 'seller') {
      const isOwnPurchaseCancellation = Number(order.user_id) === Number(actor.id) && newStatus === 'cancelled' && order.status === 'pending';
      if (!isOwnPurchaseCancellation) {
        const [[sellerItem]] = await conn.query('SELECT oi.id FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ? AND p.seller_id = ? LIMIT 1', [orderId, actor.id]);
        if (!sellerItem) throw new AppError(403, 'Đơn hàng không có sản phẩm của bạn');
        if (!['confirmed', 'shipping'].includes(newStatus)) throw new AppError(403, 'Người bán chỉ được xác nhận và chuyển đơn sang giao hàng');
        if (['vnpay', 'momo'].includes(order.payment_method) && order.payment_status !== 'paid') throw new AppError(409, 'Chỉ xử lý đơn online sau khi thanh toán thành công');
      }
    }
    if (['banking', 'vnpay', 'momo'].includes(order.payment_method) && order.payment_status !== 'paid' && newStatus !== 'cancelled') {
      throw new AppError(409, 'Chỉ xử lý đơn chuyển khoản sau khi quản trị viên xác nhận đã nhận tiền');
    }
    if (!canTransition(order.status, newStatus)) {
      throw new AppError(409, `Không thể chuyển từ "${order.status}" sang "${newStatus}"`);
    }

    let paymentStatus = order.payment_status;
    if (newStatus === 'cancelled') {
      const [items] = await conn.query('SELECT product_id, quantity FROM order_items WHERE order_id = ? ORDER BY product_id', [orderId]);
      const ids = items.map((i) => i.product_id);
      const [locked] = await conn.query('SELECT id, stock FROM products WHERE id IN (?) ORDER BY id FOR UPDATE', [ids]);
      const stockOf = new Map(locked.map((p) => [p.id, p.stock]));
      for (const it of items) {
        await conn.query('UPDATE products SET stock = stock + ? WHERE id = ?', [it.quantity, it.product_id]);
        await conn.query('INSERT INTO inventory_logs (product_id, change_qty, stock_after, reason, user_id) VALUES (?,?,?,?,?)',
          [it.product_id, it.quantity, stockOf.get(it.product_id) + it.quantity, `Hoàn kho do huỷ đơn #${orderId}`, actor.id]);
      }
      if (paymentStatus === 'paid') paymentStatus = 'refunded';
    }
    if (newStatus === 'completed' && order.payment_method === 'cod') paymentStatus = 'paid'; // thu tiền khi giao

    await conn.query('UPDATE orders SET status = ?, payment_status = ? WHERE id = ?', [newStatus, paymentStatus, orderId]);
    await conn.query('INSERT INTO order_status_history (order_id, from_status, to_status, changed_by) VALUES (?,?,?,?)',
      [orderId, order.status, newStatus, actor.id]);
    await notifyUser(conn, order.user_id, {
      type: 'order_status', title: `Đơn #${orderId}: ${STATUS_VI[newStatus]}`,
      message: `Trạng thái đơn hàng #${orderId} đã chuyển sang "${STATUS_VI[newStatus]}".`, orderId,
    });
    await conn.commit();

    sendMail({
      to: order.email,
      subject: `AgriSmart - Đơn #${orderId}: ${STATUS_VI[newStatus]}`,
      text: `Xin chào ${order.customer_name},\n\nĐơn hàng #${orderId} của bạn hiện ở trạng thái: ${STATUS_VI[newStatus]}.`,
    });
    return { id: orderId, from: order.status, to: newStatus, payment_status: paymentStatus };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function getOrderDetail(orderId) {
  const [[order]] = await pool.query(
    'SELECT o.*, u.name AS customer_name FROM orders o JOIN users u ON u.id = o.user_id WHERE o.id = ?', [orderId]);
  if (!order) throw new AppError(404, 'Không tìm thấy đơn hàng');
  const [items] = await pool.query(
    'SELECT product_id, product_name, unit_price, quantity, unit_price * quantity AS line_total FROM order_items WHERE order_id = ?', [orderId]);
  const [history] = await pool.query(
    'SELECT from_status, to_status, changed_by, created_at FROM order_status_history WHERE order_id = ? ORDER BY id', [orderId]);
  return { ...order, items, history };
}

// Expire unpaid bank transfers five minutes after checkout, returning reserved stock.
async function expireUnpaidBankTransfers() {
  const [orders] = await pool.query(
    `SELECT id, user_id FROM orders
     WHERE payment_method = 'banking' AND payment_status = 'unpaid'
       AND status = 'pending' AND created_at <= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
     ORDER BY id LIMIT 50`);
  for (const order of orders) {
    try {
      await updateStatus(order.id, 'cancelled', { id: order.user_id, role: 'system' });
    } catch (error) {
      if (error.status !== 409) console.error(`Could not expire bank transfer order #${order.id}:`, error.message);
    }
  }
}

module.exports = { checkout, updateStatus, getOrderDetail, expireUnpaidBankTransfers };
