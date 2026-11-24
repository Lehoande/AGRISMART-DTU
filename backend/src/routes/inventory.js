const router = require('express').Router();
const pool = require('../db');
const { auth, allowRoles } = require('../middleware');
const AppError = require('../lib/AppError');
const asyncHandler = require('../lib/asyncHandler');
const { positiveInt } = require('../lib/validate');
const { notifyLowStock } = require('../services/notificationService');

router.use(auth(), allowRoles('staff', 'manager', 'admin'));

// GET /api/inventory?search=&lowStockOnly=true&page=&limit=
router.get('/', asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const where = ['p.is_active = 1'];
  const params = [];
  if (req.query.search) { where.push('p.name LIKE ?'); params.push(`%${req.query.search}%`); }
  if (req.query.lowStockOnly === 'true') where.push('p.stock <= p.low_stock_threshold');
  const clause = `WHERE ${where.join(' AND ')}`;

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM products p ${clause}`, params);
  const [items] = await pool.query(
    `SELECT p.id, p.name, p.unit, p.price, p.stock, p.low_stock_threshold, p.origin, c.name AS category_name,
            (p.stock <= p.low_stock_threshold) AS is_low_stock
     FROM products p LEFT JOIN categories c ON c.id = p.category_id
     ${clause} ORDER BY p.name LIMIT ? OFFSET ?`, [...params, limit, (page - 1) * limit]);
  res.json({ items: items.map((i) => ({ ...i, is_low_stock: Boolean(i.is_low_stock) })), pagination: { page, limit, total } });
}));

// GET /api/inventory/low-stock
router.get('/low-stock', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, name, unit, stock, low_stock_threshold FROM products WHERE is_active = 1 AND stock <= low_stock_threshold ORDER BY stock ASC');
  res.json(rows);
}));

// PATCH /api/inventory/:productId/stock  { stock } HOẶC { delta }, kèm reason?
router.patch('/:productId/stock', asyncHandler(async (req, res) => {
  const productId = positiveInt(req.params.productId, 'productId');
  const { stock, delta, reason } = req.body;
  if ((stock === undefined) === (delta === undefined)) throw new AppError(400, 'Chỉ truyền một trong hai: stock hoặc delta');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[p]] = await conn.query('SELECT id, stock FROM products WHERE id = ? FOR UPDATE', [productId]);
    if (!p) throw new AppError(404, 'Product not found');
    const newStock = stock !== undefined ? Number(stock) : p.stock + Number(delta);
    if (!Number.isInteger(newStock) || newStock < 0) throw new AppError(400, 'Tồn kho mới không hợp lệ (số nguyên >= 0)');

    await conn.query('UPDATE products SET stock = ? WHERE id = ?', [newStock, productId]);
    await conn.query('INSERT INTO inventory_logs (product_id, change_qty, stock_after, reason, user_id) VALUES (?,?,?,?,?)',
      [productId, newStock - p.stock, newStock, String(reason || 'Điều chỉnh thủ công').slice(0, 160), req.user.id]);
    await notifyLowStock(conn, [productId]);
    await conn.commit();
    res.json({ product_id: productId, previous_stock: p.stock, stock: newStock });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}));

// PATCH /api/inventory/:productId/threshold { low_stock_threshold }
router.patch('/:productId/threshold', asyncHandler(async (req, res) => {
  const productId = positiveInt(req.params.productId, 'productId');
  const t = Number(req.body.low_stock_threshold);
  if (!Number.isInteger(t) || t < 0) throw new AppError(400, 'low_stock_threshold phải là số nguyên >= 0');
  const [r] = await pool.query('UPDATE products SET low_stock_threshold = ? WHERE id = ?', [t, productId]);
  if (!r.affectedRows) throw new AppError(404, 'Product not found');
  res.json({ product_id: productId, low_stock_threshold: t });
}));

// GET /api/inventory/:productId/logs
router.get('/:productId/logs', asyncHandler(async (req, res) => {
  const productId = positiveInt(req.params.productId, 'productId');
  const [rows] = await pool.query(
    `SELECT l.id, l.change_qty, l.stock_after, l.reason, u.name AS user_name, l.created_at
     FROM inventory_logs l LEFT JOIN users u ON u.id = l.user_id WHERE l.product_id = ? ORDER BY l.id DESC LIMIT 100`, [productId]);
  res.json(rows);
}));

module.exports = router;
