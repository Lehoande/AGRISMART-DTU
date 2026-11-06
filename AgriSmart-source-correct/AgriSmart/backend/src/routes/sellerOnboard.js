const router = require('express').Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { auth, allowRoles } = require('../middleware');
const AppError = require('../lib/AppError');
const asyncHandler = require('../lib/asyncHandler');

router.post('/', auth(), allowRoles('customer'), asyncHandler(async (req, res) => {
  const farmName = String(req.body.farm_name || '').trim();
  const farmAddress = String(req.body.farm_address || '').trim();
  if (farmName.length < 2 || farmName.length > 180) throw new AppError(400, 'Tên gian hàng cần từ 2 đến 180 ký tự');
  if (farmAddress.length < 5 || farmAddress.length > 500) throw new AppError(400, 'Địa chỉ nông trại cần từ 5 đến 500 ký tự');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[user]] = await conn.query('SELECT id, name, email, role FROM users WHERE id = ? FOR UPDATE', [req.user.id]);
    if (!user || user.role !== 'customer') throw new AppError(409, 'Tài khoản này không thể tạo thêm gian hàng');
    await conn.query("UPDATE users SET role = 'seller' WHERE id = ?", [user.id]);
    await conn.query("INSERT INTO seller_profiles(user_id, farm_name, farm_address, status) VALUES(?,?,?,'pending')", [user.id, farmName, farmAddress]);
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: 'seller' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    await conn.commit();
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: 'seller' } });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}));

module.exports = router;
