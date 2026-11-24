const router = require('express').Router();
const pool = require('../db');
const { auth, allowRoles } = require('../middleware');
const AppError = require('../lib/AppError');
const asyncHandler = require('../lib/asyncHandler');
const { positiveInt } = require('../lib/validate');
const { STATUSES } = require('../services/orderStatus');
const orderService = require('../services/orderService');

const STAFF = ['staff', 'manager', 'admin'];
router.use(auth());

// POST /api/orders  (alias: /api/orders/checkout)
// body: { shipping_name, shipping_phone, shipping_address, shipping_ward?, shipping_district?, shipping_province?, payment_method?: 'cod'|'banking' }
const checkoutHandler = asyncHandler(async (req, res) => {
  const { shipping_name, shipping_phone, shipping_address, shipping_street_address, shipping_ward, shipping_district, shipping_province, payment_method = 'cod', promo_code = null } = req.body;
  if (!shipping_name || !shipping_phone || !shipping_address) throw new AppError(400, 'Shipping details required');
  if (String(shipping_name).trim().length < 2) throw new AppError(400, 'Tên người nhận không hợp lệ');
  if (!/^[+\d][\d\s.-]{7,14}$/.test(String(shipping_phone))) throw new AppError(400, 'Số điện thoại không hợp lệ');
  if (String(shipping_address).trim().length < 5) throw new AppError(400, 'Địa chỉ giao hàng không hợp lệ');
  if (!['cod', 'banking', 'vnpay', 'momo'].includes(payment_method)) throw new AppError(400, "Phương thức thanh toán chưa được hỗ trợ.");
  const idempotencyKey = String(req.get('Idempotency-Key') || '').trim();
  if (idempotencyKey && !/^[0-9a-f-]{36}$/i.test(idempotencyKey)) throw new AppError(400, 'Idempotency-Key không hợp lệ');

  const order = await orderService.checkout(req.user.id, {
    shipping_name: String(shipping_name).trim(), shipping_phone: String(shipping_phone).trim(),
    shipping_address: String(shipping_address).trim(),
    shipping_street_address: shipping_street_address ? String(shipping_street_address).trim() : null,
    shipping_ward: shipping_ward ? String(shipping_ward).trim() : null,
    shipping_district: shipping_district ? String(shipping_district).trim() : null,
    shipping_province: shipping_province ? String(shipping_province).trim() : null,
    payment_method, promo_code: promo_code ? String(promo_code).trim().toUpperCase() : null,
  }, idempotencyKey || null);
  res.status(201).json(order);
});
router.post('/', checkoutHandler);
router.post('/checkout', checkoutHandler);

// GET /api/orders?status=&limit=&page=  (khách: đơn của mình; staff/manager/admin: tất cả) - giữ dạng mảng + items
router.get('/', asyncHandler(async (req, res) => {
  const where = [];
  const params = [];
  if (req.query.view === 'buyer') {
    if (!['customer', 'seller'].includes(req.user.role)) throw new AppError(403, 'Tài khoản này không có quyền xem đơn mua');
    where.push('o.user_id = ?'); params.push(req.user.id);
  } else if (req.user.role === 'seller') {
    where.push('EXISTS (SELECT 1 FROM order_items soi JOIN products sp ON sp.id = soi.product_id WHERE soi.order_id = o.id AND sp.seller_id = ?)');
    params.push(req.user.id);
  } else if (!STAFF.includes(req.user.role)) { where.push('o.user_id = ?'); params.push(req.user.id); }
  if (req.query.status) {
    if (!STATUSES.includes(req.query.status)) throw new AppError(400, 'status không hợp lệ');
    where.push('o.status = ?'); params.push(req.query.status);
  }
  const limit = Math.min(Number(req.query.limit) || 200, 500);
  const offset = (Math.max(Number(req.query.page) || 1, 1) - 1) * limit;
  const [orders] = await pool.query(
    `SELECT o.*, u.name customer_name FROM orders o JOIN users u ON u.id = o.user_id
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY o.created_at DESC, o.id DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]);
  if (orders.length) {
    const [items] = await pool.query(
      `SELECT oi.order_id, oi.product_id, oi.product_name, oi.unit_price, oi.quantity, p.image_url
       FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id WHERE oi.order_id IN (?)`, [orders.map((o) => o.id)]);
    for (const o of orders) o.items = items.filter((i) => i.order_id === o.id).map(({ order_id, ...rest }) => rest);
  }
  res.json(orders);
}));

// GET /api/orders/:id  (kèm items + lịch sử trạng thái)
router.get('/:id', asyncHandler(async (req, res) => {
  const order = await orderService.getOrderDetail(positiveInt(req.params.id, 'id'));
  if (!STAFF.includes(req.user.role) && order.user_id !== req.user.id) {
    const [[sellerItem]] = req.user.role === 'seller'
      ? await pool.query('SELECT oi.id FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ? AND p.seller_id = ? LIMIT 1', [order.id, req.user.id])
      : [[null]];
    if (!sellerItem) throw new AppError(403, 'Không phải đơn hàng của bạn');
  }
  res.json(order);
}));

// PATCH /api/orders/:id/status { status }  (staff/manager/admin) - chỉ cho phép chuyển trạng thái hợp lệ
router.patch('/:id/status', allowRoles(...STAFF, 'seller'), asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) throw new AppError(400, 'Invalid status');
  res.json(await orderService.updateStatus(positiveInt(req.params.id, 'id'), status, req.user));
}));

// PATCH /api/orders/:id/cancel  (khách huỷ đơn pending của mình)
router.patch('/:id/cancel', asyncHandler(async (req, res) => {
  res.json(await orderService.updateStatus(positiveInt(req.params.id, 'id'), 'cancelled', req.user));
}));

module.exports = router;
