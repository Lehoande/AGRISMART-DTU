const router = require('express').Router();
const pool = require('../db');
const { auth } = require('../middleware');
const AppError = require('../lib/AppError');
const asyncHandler = require('../lib/asyncHandler');
const { positiveInt } = require('../lib/validate');

router.use(auth());

// GET /api/notifications?unreadOnly=true   (mobile/web polling 15-30s)
router.get('/', asyncHandler(async (req, res) => {
  const unread = req.query.unreadOnly === 'true' ? 'AND is_read = 0' : '';
  const [items] = await pool.query(
    `SELECT id, type, title, message, order_id, is_read, created_at FROM notifications
     WHERE user_id = ? ${unread} ORDER BY id DESC LIMIT 100`, [req.user.id]);
  const [[{ unread_count }]] = await pool.query('SELECT COUNT(*) AS unread_count FROM notifications WHERE user_id = ? AND is_read = 0', [req.user.id]);
  res.json({ unread_count, items: items.map((n) => ({ ...n, is_read: Boolean(n.is_read) })) });
}));

router.patch('/read-all', asyncHandler(async (req, res) => {
  await pool.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
  res.json({ message: 'All marked as read' });
}));

router.patch('/:id/read', asyncHandler(async (req, res) => {
  const [r] = await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
    [positiveInt(req.params.id, 'id'), req.user.id]);
  if (!r.affectedRows) throw new AppError(404, 'Không tìm thấy thông báo');
  res.json({ message: 'Marked as read' });
}));

module.exports = router;
