const pool = require('../db');
const AppError = require('../lib/AppError');
const { canTransition, STATUS_VI } = require('./orderStatus');
const { notifyUser, notifyLowStock } = require('./notificationService');
const { sendMail } = require('./mailer');

const vnd = (n) => `${Number(n).toLocaleString('vi-VN')}đ`;

/** Thanh toán giả lập: COD không thu ngay; card thất bại nếu token rỗng hoặc 'tok_fail'. */
function mockCharge({ method, token, amount }) {
  if (method === 'cod') return { paymentStatus: 'unpaid', ref: null };
  if (!token || token === 'tok_fail') throw new AppError(402, 'Thanh toán thất bại (sandbox)');
  return { paymentStatus: 'paid', ref: `MOCK-${Date.now()}-${Math.round(amount)}` };
}

/**
 * CHECKOUT - xử lý rủi ro R1 (race condition tồn kho). Một transaction duy nhất:
 * đọc giỏ -> khoá dòng products theo thứ tự id (FOR UPDATE, tránh deadlock) -> kiểm tra tồn
 * -> trừ kho -> thanh toán mock -> tạo order/items -> ghi log -> xoá giỏ -> thông báo.
 */
async function checkout(userId, { shipping_name, shipping_phone, shipping_address, payment_method, payment_token }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [cart] = await conn.query('SELECT product_id, quantity FROM cart_items WHERE user_id = ? ORDER BY product_id', [userId]);
    if (!cart.length) throw new AppError(400, 'Cart is empty');

    const ids = cart.map((c) => c.product_id);
    const [products] = await conn.query(
      'SELECT id, name, price, stock, is_active FROM products WHERE id IN (?) ORDER BY id FOR UPDATE', [ids]);
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
    const grandTotal = total + shippingFee;
    const pay = mockCharge({ method: payment_method, token: payment_token, amount: grandTotal });

    const [o] = await conn.query(
      `INSERT INTO orders (user_id, total, shipping_fee, status, shipping_name, shipping_phone, shipping_address, payment_method, payment_status, payment_ref)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [userId, grandTotal, shippingFee, 'pending', shipping_name, shipping_phone, shipping_address, payment_method, pay.paymentStatus, pay.ref]);
    const orderId = o.insertId;

    await conn.query('INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity) VALUES ?',
      [lines.map((l) => [orderId, l.product.id, l.product.name, l.product.price, l.quantity])]);
    await conn.query('INSERT INTO inventory_logs (product_id, change_qty, stock_after, reason, user_id) VALUES ?',
      [lines.map((l) => [l.product.id, -l.quantity, l.product.stock - l.quantity, `Bán cho đơn #${orderId}`, userId])]);
    await conn.query('INSERT INTO browsing_events (user_id, product_id, event_type) VALUES ?',
      [lines.map((l) => [userId, l.product.id, 'purchase'])]);
    await conn.query('INSERT INTO order_status_history (order_id, from_status, to_status, changed_by) VALUES (?,?,?,?)',
      [orderId, null, 'pending', userId]);
    await conn.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    await notifyUser(conn, userId, {
      type: 'order_status', title: 'Đặt hàng thành công',
      message: `Đơn #${orderId} đã được tạo, tổng ${vnd(grandTotal)}.`, orderId,
    });
    await notifyLowStock(conn, ids);

    const [[user]] = await conn.query('SELECT email, name FROM users WHERE id = ?', [userId]);
    await conn.commit();

    sendMail({
      to: user.email,
      subject: `AgriSmart - Xác nhận đơn hàng #${orderId}`,
      text: `Xin chào ${user.name},\n\nĐơn #${orderId} đã được ghi nhận.\nTạm tính: ${vnd(total)}\nPhí vận chuyển: ${vnd(shippingFee)}\nTổng tiền: ${vnd(grandTotal)}\nĐịa chỉ giao: ${shipping_address}\n\nCảm ơn bạn đã mua nông sản tại AgriSmart!`,
    });
    return { id: orderId, subtotal: total, shipping_fee: shippingFee, total: grandTotal, status: 'pending', payment_status: pay.paymentStatus };
  } catch (err) {
    await conn.rollback();
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
      'SELECT o.*, u.email, u.name AS customer_name FROM orders o JOIN users u ON u.id = o.user_id WHERE o.id = ? FOR UPDATE', [orderId]);
    if (!order) throw new AppError(404, 'Không tìm thấy đơn hàng');

    if (actor.role === 'customer') {
      if (order.user_id !== actor.id) throw new AppError(403, 'Không phải đơn hàng của bạn');
      if (newStatus !== 'cancelled' || order.status !== 'pending') {
        throw new AppError(409, 'Bạn chỉ có thể huỷ đơn khi đang chờ xác nhận');
      }
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

module.exports = { checkout, updateStatus, getOrderDetail };
