const router = require('express').Router();
const pool = require('../db');
const { auth, allowRoles } = require('../middleware');
const AppError = require('../lib/AppError');
const asyncHandler = require('../lib/asyncHandler');

router.use(auth(), allowRoles('manager', 'admin'));

// Doanh thu tính trên đơn đã xác nhận trở đi (đồng bộ với /api/admin/stats của Huy)
const COUNTED = "('confirmed','shipping','completed')";

function parseRange(q) {
  const to = q.to ? new Date(q.to) : new Date();
  const from = q.from ? new Date(q.from) : new Date(to.getTime() - 30 * 24 * 3600 * 1000);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) throw new AppError(400, 'from/to phải là ngày hợp lệ (YYYY-MM-DD)');
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

// GET /api/stats/revenue?period=daily|monthly&from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/revenue', asyncHandler(async (req, res) => {
  const fmt = { daily: '%Y-%m-%d', monthly: '%Y-%m' }[req.query.period || 'daily'];
  if (!fmt) throw new AppError(400, 'period phải là daily hoặc monthly');
  const { from, to } = parseRange(req.query);
  const [rows] = await pool.query(
    `SELECT DATE_FORMAT(created_at, '${fmt}') AS period, COUNT(*) AS orders, SUM(total) AS revenue
     FROM orders WHERE status IN ${COUNTED} AND created_at BETWEEN ? AND ? GROUP BY period ORDER BY period`, [from, to]);
  res.json(rows);
}));

// GET /api/stats/top-products?limit=5&from=&to=
router.get('/top-products', asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 5, 50);
  const { from, to } = parseRange(req.query);
  const [rows] = await pool.query(
    `SELECT oi.product_id, oi.product_name, SUM(oi.quantity) AS total_sold, SUM(oi.unit_price * oi.quantity) AS revenue
     FROM order_items oi JOIN orders o ON o.id = oi.order_id
     WHERE o.status IN ${COUNTED} AND o.created_at BETWEEN ? AND ?
     GROUP BY oi.product_id, oi.product_name ORDER BY total_sold DESC LIMIT ?`, [from, to, limit]);
  res.json(rows);
}));

// GET /api/stats/summary
router.get('/summary', asyncHandler(async (req, res) => {
  const [[rev]] = await pool.query(`SELECT COALESCE(SUM(total),0) AS total_revenue, COUNT(*) AS total_orders FROM orders WHERE status IN ${COUNTED}`);
  const [by_status] = await pool.query('SELECT status, COUNT(*) AS count FROM orders GROUP BY status');
  const [[low]] = await pool.query('SELECT COUNT(*) AS low_stock_products FROM products WHERE is_active = 1 AND stock <= low_stock_threshold');
  const [[cust]] = await pool.query("SELECT COUNT(*) AS customers FROM users WHERE role = 'customer'");
  res.json({ ...rev, orders_by_status: by_status, ...low, ...cust });
}));

module.exports = router;
