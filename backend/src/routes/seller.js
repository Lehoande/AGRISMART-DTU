const router = require('express').Router();
const pool = require('../db');
const { auth, allowRoles } = require('../middleware');
const AppError = require('../lib/AppError');
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
  const [[profile]] = await pool.query('SELECT farm_name, farm_address, status, review_note, citizen_id, citizen_card_date, id_card_front_url, id_card_back_url FROM seller_profiles WHERE user_id = ?', [req.user.id]);
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

router.patch('/profile', asyncHandler(async (req, res) => {
  const citizenId = req.body.citizen_id ? String(req.body.citizen_id).trim() : null;
  const citizenCardDate = req.body.citizen_card_date ? String(req.body.citizen_card_date).trim() : null;
  const idCardFrontUrl = req.body.id_card_front_url ? String(req.body.id_card_front_url).trim() : null;
  const idCardBackUrl = req.body.id_card_back_url ? String(req.body.id_card_back_url).trim() : null;
  const farmName = req.body.farm_name ? String(req.body.farm_name).trim() : null;
  const farmAddress = req.body.farm_address ? String(req.body.farm_address).trim() : null;

  if (farmName && (farmName.length < 2 || farmName.length > 180)) {
    throw new AppError(400, 'Tên gian hàng cần từ 2 đến 180 ký tự');
  }
  if (farmAddress && (farmAddress.length < 5 || farmAddress.length > 500)) {
    throw new AppError(400, 'Địa chỉ nông trại cần từ 5 đến 500 ký tự');
  }
  if (citizenId && !/^\d{12}$/.test(citizenId)) {
    throw new AppError(400, 'Số Căn cước công dân phải gồm đúng 12 chữ số');
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[existing]] = await conn.query('SELECT user_id, status FROM seller_profiles WHERE user_id = ? FOR UPDATE', [req.user.id]);
    if (!existing) throw new AppError(404, 'Không tìm thấy hồ sơ gian hàng');

    await conn.query(
      `UPDATE seller_profiles
       SET farm_name = COALESCE(?, farm_name),
           farm_address = COALESCE(?, farm_address),
           citizen_id = COALESCE(?, citizen_id),
           citizen_card_date = COALESCE(?, citizen_card_date),
           id_card_front_url = COALESCE(?, id_card_front_url),
           id_card_back_url = COALESCE(?, id_card_back_url),
           status = 'pending',
           reviewed_at = NULL,
           reviewed_by = NULL,
           review_note = NULL
       WHERE user_id = ?`,
      [farmName, farmAddress, citizenId, citizenCardDate, idCardFrontUrl, idCardBackUrl, req.user.id]
    );

    await conn.query(
      'INSERT INTO notifications(user_id, type, title, message) VALUES(?, ?, ?, ?)',
      [req.user.id, 'seller_resubmitted', 'Đã gửi lại hồ sơ CCCD', 'Hồ sơ Căn cước công dân của bạn đã được cập nhật và đang chờ Ban quản trị xét duyệt lại.']
    );

    await conn.commit();

    const [[updated]] = await pool.query(
      'SELECT farm_name, farm_address, status, review_note, citizen_id, citizen_card_date, id_card_front_url, id_card_back_url FROM seller_profiles WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ message: 'Đã gửi lại hồ sơ thành công', profile: updated });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}));

module.exports = router;
