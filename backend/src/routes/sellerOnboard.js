const router = require('express').Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { auth, allowRoles } = require('../middleware');
const AppError = require('../lib/AppError');
const asyncHandler = require('../lib/asyncHandler');

router.post('/', auth(), allowRoles('customer'), asyncHandler(async (req, res) => {
  const farmName = String(req.body.farm_name || '').trim();
  const farmAddress = String(req.body.farm_address || '').trim();
  const citizenId = req.body.citizen_id ? String(req.body.citizen_id).trim() : null;
  const citizenCardDate = req.body.citizen_card_date ? String(req.body.citizen_card_date).trim() : null;
  const idCardFrontUrl = req.body.id_card_front_url ? String(req.body.id_card_front_url).trim() : null;
  const idCardBackUrl = req.body.id_card_back_url ? String(req.body.id_card_back_url).trim() : null;

  if (farmName.length < 2 || farmName.length > 180) throw new AppError(400, 'Tên gian hàng cần từ 2 đến 180 ký tự');
  if (farmAddress.length < 5 || farmAddress.length > 500) throw new AppError(400, 'Địa chỉ nông trại cần từ 5 đến 500 ký tự');
  if (citizenId && !/^\d{9,12}$/.test(citizenId)) throw new AppError(400, 'Số Căn cước công dân phải từ 9 đến 12 chữ số');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[user]] = await conn.query('SELECT id, name, email, role FROM users WHERE id = ? FOR UPDATE', [req.user.id]);
    if (!user || user.role !== 'customer') throw new AppError(409, 'Tài khoản này không thể tạo thêm gian hàng');
    await conn.query("UPDATE users SET role = 'seller' WHERE id = ?", [user.id]);
    await conn.query(
      "INSERT INTO seller_profiles(user_id, farm_name, farm_address, citizen_id, citizen_card_date, id_card_front_url, id_card_back_url, status) VALUES(?,?,?,?,?,?,?,'pending')",
      [user.id, farmName, farmAddress, citizenId, citizenCardDate || null, idCardFrontUrl, idCardBackUrl]
    );
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
