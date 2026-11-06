const router = require('express').Router();
const pool = require('../db');
const { auth, allowRoles } = require('../middleware');
const asyncHandler = require('../lib/asyncHandler');

router.use(auth(), allowRoles('seller'));

router.get('/products', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.*, c.name category_name, c.slug category_slug FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.seller_id = ? ORDER BY p.created_at DESC`, [req.user.id]);
  res.json(rows);
}));

router.get('/summary', asyncHandler(async (req, res) => {
  const [[products]] = await pool.query('SELECT COUNT(*) products, COALESCE(SUM(stock),0) inventory_units FROM products WHERE seller_id = ? AND is_active = 1', [req.user.id]);
  const [[sales]] = await pool.query(
    `SELECT COUNT(DISTINCT o.id) orders, COALESCE(SUM(oi.unit_price * oi.quantity),0) revenue
     FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id
     WHERE p.seller_id = ? AND o.status IN ('confirmed','shipping','completed')`, [req.user.id]);
  const [[profile]] = await pool.query('SELECT farm_name, farm_address, status, review_note FROM seller_profiles WHERE user_id = ?', [req.user.id]);
  res.json({ ...products, ...sales, seller: profile || null });
}));

// Private seller dashboard data. Price comparisons are anonymized aggregates of
// currently active AgriSmart listings in the same category and unit.
router.get('/insights', asyncHandler(async (req, res) => {
  const [products] = await pool.query(
    `SELECT p.id, p.name, p.description, p.price, p.unit, p.stock, p.low_stock_threshold,
            p.origin, p.region, p.harvest_date, p.traceability_code, p.certification,
            p.storage_condition, c.name AS category_name,
            (SELECT COUNT(*) FROM products m WHERE m.category_id = p.category_id
              AND m.unit = p.unit AND m.seller_id <> p.seller_id AND m.is_active = 1 AND m.stock > 0) AS benchmark_count,
            (SELECT AVG(m.price) FROM products m WHERE m.category_id = p.category_id
              AND m.unit = p.unit AND m.seller_id <> p.seller_id AND m.is_active = 1 AND m.stock > 0) AS benchmark_average,
            (SELECT MIN(m.price) FROM products m WHERE m.category_id = p.category_id
              AND m.unit = p.unit AND m.seller_id <> p.seller_id AND m.is_active = 1 AND m.stock > 0) AS benchmark_min,
            (SELECT MAX(m.price) FROM products m WHERE m.category_id = p.category_id
              AND m.unit = p.unit AND m.seller_id <> p.seller_id AND m.is_active = 1 AND m.stock > 0) AS benchmark_max
     FROM products p LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.seller_id = ? AND p.is_active = 1 ORDER BY p.name`, [req.user.id]);
  res.json({ updated_at: new Date().toISOString(), products });
}));

router.get('/reviews', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT r.id, r.rating, r.comment, r.created_at, u.name customer_name, p.name product_name
     FROM reviews r JOIN products p ON p.id = r.product_id JOIN users u ON u.id = r.user_id
     WHERE p.seller_id = ? ORDER BY r.created_at DESC`, [req.user.id]);
  res.json(rows);
}));

module.exports = router;
