const router = require('express').Router();
const pool = require('../db');
const asyncHandler = require('../lib/asyncHandler');

router.get('/stats', asyncHandler(async (_req, res) => {
  const [[buyers]] = await pool.query("SELECT COUNT(*) AS total FROM users WHERE role = 'customer'");
  const [[sellers]] = await pool.query("SELECT COUNT(*) AS total FROM seller_profiles WHERE status = 'approved'");
  const [[products]] = await pool.query("SELECT COUNT(*) AS total FROM products p WHERE p.is_active = 1 AND (p.seller_id IS NULL OR EXISTS (SELECT 1 FROM seller_profiles sp WHERE sp.user_id = p.seller_id AND sp.status = 'approved'))");
  const [[reviews]] = await pool.query('SELECT COUNT(*) AS total FROM reviews');
  res.json({ buyers: Number(buyers.total), sellers: Number(sellers.total), products: Number(products.total), reviews: Number(reviews.total) });
}));

router.get('/reviews', asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS customer_name, p.name AS product_name
     FROM reviews r JOIN users u ON u.id = r.user_id JOIN products p ON p.id = r.product_id
     WHERE p.is_active = 1 AND (p.seller_id IS NULL OR EXISTS (SELECT 1 FROM seller_profiles sp WHERE sp.user_id = p.seller_id AND sp.status = 'approved'))
       AND TRIM(COALESCE(r.comment, '')) <> ''
     ORDER BY r.created_at DESC LIMIT 6`);
  res.json(rows);
}));

module.exports = router;
