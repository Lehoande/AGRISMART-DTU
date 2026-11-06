/** Nhận `conn` để chạy chung transaction với nghiệp vụ gọi nó. */
async function notifyUser(conn, userId, { type, title, message, orderId = null }) {
  await conn.query('INSERT INTO notifications (user_id, type, title, message, order_id) VALUES (?,?,?,?,?)',
    [userId, type, title, message, orderId]);
}

/** Báo staff/manager khi sản phẩm xuống dưới ngưỡng tồn thấp. */
async function notifyLowStock(conn, productIds) {
  if (!productIds.length) return;
  const [low] = await conn.query(
    'SELECT id, name, stock, low_stock_threshold FROM products WHERE id IN (?) AND stock <= low_stock_threshold', [productIds]);
  for (const p of low) {
    await conn.query(
      "INSERT INTO notifications (user_id, type, title, message) SELECT id, 'low_stock', ?, ? FROM users WHERE role IN ('staff','manager')",
      ['Cảnh báo tồn kho thấp', `${p.name} chỉ còn ${p.stock} (ngưỡng ${p.low_stock_threshold})`]);
  }
}

module.exports = { notifyUser, notifyLowStock };
