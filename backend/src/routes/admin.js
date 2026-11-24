const router = require('express').Router();
const pool = require('../db');
const { auth, allowRoles } = require('../middleware');
const AppError = require('../lib/AppError');
const asyncHandler = require('../lib/asyncHandler');
const { positiveInt } = require('../lib/validate');

router.use(auth(), allowRoles('admin', 'manager'));

router.get('/users', asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(`SELECT id,name,email,phone,role,created_at FROM users ORDER BY created_at DESC LIMIT 500`);
  res.json(rows);
}));

router.patch('/users/:id/role', allowRoles('admin'), asyncHandler(async (req, res) => {
  const id = positiveInt(req.params.id, 'id');
  const role = String(req.body.role || '');
  if (!['customer','seller','staff','manager','admin'].includes(role)) throw new AppError(400, 'Vai trò không hợp lệ');
  if (id === Number(req.user.id)) throw new AppError(409, 'Không thể tự đổi vai trò tài khoản đang đăng nhập');
  const [r] = await pool.query('UPDATE users SET role=? WHERE id=?', [role,id]);
  if (!r.affectedRows) throw new AppError(404, 'Không tìm thấy tài khoản');
  res.json({ id, role });
}));

router.get('/products', asyncHandler(async (_req,res)=>{
  const [rows]=await pool.query(`SELECT p.id,p.name,p.price,p.stock,p.unit,p.is_active,p.created_at,c.name category_name,u.name seller_name FROM products p LEFT JOIN categories c ON c.id=p.category_id LEFT JOIN users u ON u.id=p.seller_id ORDER BY p.created_at DESC LIMIT 500`);
  res.json(rows.map((row)=>({...row,is_active:Boolean(row.is_active)})));
}));

router.patch('/products/:id/visibility', allowRoles('admin'), asyncHandler(async(req,res)=>{
  const id=positiveInt(req.params.id,'id');
  const active=Boolean(req.body.is_active);
  const [r]=await pool.query('UPDATE products SET is_active=? WHERE id=?',[active?1:0,id]);
  if(!r.affectedRows) throw new AppError(404,'Không tìm thấy sản phẩm');
  res.json({id,is_active:active});
}));

router.get('/reviews', asyncHandler(async(_req,res)=>{
  const [rows]=await pool.query(`SELECT r.id,r.rating,r.comment,r.created_at,u.name customer_name,p.name product_name FROM reviews r JOIN users u ON u.id=r.user_id JOIN products p ON p.id=r.product_id ORDER BY r.created_at DESC LIMIT 500`);
  res.json(rows);
}));

router.delete('/reviews/:id', allowRoles('admin'), asyncHandler(async(req,res)=>{
  const [r]=await pool.query('DELETE FROM reviews WHERE id=?',[positiveInt(req.params.id,'id')]);
  if(!r.affectedRows) throw new AppError(404,'Không tìm thấy đánh giá');
  res.json({message:'Đã xóa đánh giá'});
}));

router.get('/sellers', asyncHandler(async (req, res) => {
  const status = String(req.query.status || 'pending');
  if (!['pending', 'approved', 'rejected', 'all'].includes(status)) {
    throw new AppError(400, 'Trạng thái hồ sơ không hợp lệ');
  }
  const where = status === 'all' ? '' : 'WHERE sp.status = ?';
  const params = status === 'all' ? [] : [status];
  const [rows] = await pool.query(
    `SELECT sp.user_id, sp.farm_name, sp.farm_address, sp.status, sp.created_at,
            sp.reviewed_at, sp.reviewed_by, sp.review_note,
            sp.citizen_id, sp.citizen_card_date, sp.id_card_front_url, sp.id_card_back_url,
            u.name AS representative_name, u.email, u.phone
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
    const [[profile]] = await conn.query('SELECT user_id, farm_name, status FROM seller_profiles WHERE user_id = ? FOR UPDATE', [userId]);
    if (!profile) throw new AppError(404, 'Không tìm thấy hồ sơ gian hàng');
    if (profile.status !== 'pending') throw new AppError(409, 'Hồ sơ này không còn ở trạng thái chờ duyệt');
    await conn.query(
      'UPDATE seller_profiles SET status = ?, reviewed_at = NOW(), reviewed_by = ?, review_note = ? WHERE user_id = ?',
      [status, req.user.id, note || null, userId],
    );

    const notifTitle = status === 'approved' ? 'Gian hàng đã được phê duyệt thành công' : 'Hồ sơ Căn cước công dân chưa được duyệt';
    const notifMsg = status === 'approved'
      ? `Chúc mừng! Hồ sơ xác thực CCCD và gian hàng "${profile.farm_name}" của bạn đã được phê duyệt. Bạn đã có thể bắt đầu đăng bán sản phẩm.`
      : `Hồ sơ CCCD của bạn chưa được duyệt.${note ? ` Lý do: ${note}` : ''}. Vui lòng kiểm tra và cập nhật lại thông tin CCCD trong phần Hồ sơ người bán.`;

    await conn.query(
      'INSERT INTO notifications(user_id, type, title, message) VALUES(?, ?, ?, ?)',
      [userId, status === 'approved' ? 'seller_approved' : 'seller_rejected', notifTitle, notifMsg],
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
