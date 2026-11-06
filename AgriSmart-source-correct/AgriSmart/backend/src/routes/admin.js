const router = require('express').Router();
const pool = require('../db');
const { auth, allowRoles } = require('../middleware');
const AppError = require('../lib/AppError');
const asyncHandler = require('../lib/asyncHandler');
const { positiveInt } = require('../lib/validate');

router.use(auth(), allowRoles('admin', 'manager'));

router.get('/sellers', asyncHandler(async (req, res) => {
  const status = String(req.query.status || 'pending');
  if (!['pending', 'approved', 'rejected', 'all'].includes(status)) {
    throw new AppError(400, 'Trạng thái hồ sơ không hợp lệ');
  }
  const where = status === 'all' ? '' : 'WHERE sp.status = ?';
  const params = status === 'all' ? [] : [status];
  const [rows] = await pool.query(
    `SELECT sp.user_id, sp.farm_name, sp.farm_address, sp.status, sp.created_at,
            sp.reviewed_at, sp.reviewed_by, sp.review_note, u.name AS representative_name,
            u.email, u.phone
     FROM seller_profiles sp JOIN users u ON u.id = sp.user_id
     ${where} ORDER BY FIELD(sp.status, 'pending', 'approved', 'rejected'), sp.created_at DESC`,
    params,
  );
  res.json(rows);
}));

router.patch('/sellers/:id/status', asyncHandler(async (req, res) => {
  const userId = positiveInt(req.params.id, 'id');
  const status = String(req.body.status || '');
  const note = req.body.note == null ? null : String(req.body.note).trim();
  if (!['approved', 'rejected'].includes(status)) throw new AppError(400, 'Chọn duyệt hoặc từ chối hồ sơ');
  if (note && note.length > 1000) throw new AppError(400, 'Ghi chú tối đa 1000 ký tự');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[profile]] = await conn.query('SELECT user_id, status FROM seller_profiles WHERE user_id = ? FOR UPDATE', [userId]);
    if (!profile) throw new AppError(404, 'Không tìm thấy hồ sơ gian hàng');
    if (profile.status !== 'pending') throw new AppError(409, 'Hồ sơ này không còn ở trạng thái chờ duyệt');
    await conn.query(
      'UPDATE seller_profiles SET status = ?, reviewed_at = NOW(), reviewed_by = ?, review_note = ? WHERE user_id = ?',
      [status, req.user.id, note || null, userId],
    );
    await conn.commit();
    res.json({ user_id: userId, status, reviewed_at: new Date().toISOString(), review_note: note || null });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}));

module.exports = router;
