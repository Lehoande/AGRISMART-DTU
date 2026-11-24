const router = require('express').Router();
const pool = require('../db');
const { auth, allowRoles } = require('../middleware');
const AppError = require('../lib/AppError');
const asyncHandler = require('../lib/asyncHandler');
const { positiveInt } = require('../lib/validate');

router.use(auth());
const STAFF = ['staff', 'manager', 'admin'];

router.post('/', allowRoles('customer', 'seller'), asyncHandler(async (req, res) => {
  const orderId = positiveInt(req.body.order_id, 'order_id');
  const productId = req.body.product_id ? positiveInt(req.body.product_id, 'product_id') : null;
  const issueType = String(req.body.issue_type || '').trim().slice(0, 80);
  const description = String(req.body.description || '').trim();
  if (!issueType || description.length < 10) throw new AppError(400, 'Vui lòng chọn loại vấn đề và mô tả ít nhất 10 ký tự');
  const [[order]] = await pool.query('SELECT id, status FROM orders WHERE id = ? AND user_id = ?', [orderId, req.user.id]);
  if (!order || order.status === 'cancelled') throw new AppError(404, 'Không tìm thấy đơn hợp lệ');
  if (productId) {
    const [[item]] = await pool.query('SELECT id FROM order_items WHERE order_id = ? AND product_id = ?', [orderId, productId]);
    if (!item) throw new AppError(400, 'Sản phẩm không thuộc đơn hàng này');
  }
  const evidenceUrl = req.body.evidence_url ? String(req.body.evidence_url).trim().slice(0, 2000) : null;
  if (evidenceUrl && !/^https?:\/\//i.test(evidenceUrl)) throw new AppError(400, 'Đường dẫn bằng chứng phải bắt đầu bằng http:// hoặc https://');
  const [result] = await pool.query(
    'INSERT INTO complaints(user_id,order_id,product_id,issue_type,description,evidence_url) VALUES(?,?,?,?,?,?)',
    [req.user.id, orderId, productId, issueType, description, evidenceUrl]);
  res.status(201).json({ id: result.insertId, status: 'submitted' });
}));

router.get('/', asyncHandler(async (req, res) => {
  let clause = 'c.user_id = ?';
  let params = [req.user.id];
  if (STAFF.includes(req.user.role)) { clause = '1 = 1'; params = []; }
  else if (req.user.role === 'seller' && req.query.view !== 'buyer') {
    clause = 'EXISTS (SELECT 1 FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = c.order_id AND p.seller_id = ?)';
    params = [req.user.id];
  }
  const [rows] = await pool.query(
    `SELECT c.*, u.name customer_name, p.name product_name FROM complaints c
     JOIN users u ON u.id = c.user_id LEFT JOIN products p ON p.id = c.product_id
     WHERE ${clause} ORDER BY c.created_at DESC`, params);
  res.json(rows);
}));

router.patch('/:id/status', allowRoles(...STAFF), asyncHandler(async (req, res) => {
  const id = positiveInt(req.params.id, 'id');
  const allowed = ['submitted', 'investigating', 'resolved', 'rejected', 'undetermined'];
  if (!allowed.includes(req.body.status)) throw new AppError(400, 'Trạng thái khiếu nại không hợp lệ');
  const [result] = await pool.query('UPDATE complaints SET status = ?, staff_note = ? WHERE id = ?',
    [req.body.status, String(req.body.staff_note || '').slice(0, 5000) || null, id]);
  if (!result.affectedRows) throw new AppError(404, 'Không tìm thấy khiếu nại');
  res.json({ id, status: req.body.status });
}));

module.exports = router;
