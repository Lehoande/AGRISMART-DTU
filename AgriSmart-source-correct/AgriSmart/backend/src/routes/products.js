const router = require('express').Router();
const pool = require('../db');
const { auth, allowRoles } = require('../middleware');
const AppError = require('../lib/AppError');
const asyncHandler = require('../lib/asyncHandler');
const { positiveInt } = require('../lib/validate');

router.get('/', asyncHandler(async (req, res) => {
  const where = ['p.is_active = 1', '(p.seller_id IS NULL OR EXISTS (SELECT 1 FROM seller_profiles sp WHERE sp.user_id = p.seller_id AND sp.status = \'approved\'))'];
  const params = [];
  if (req.query.search) {
    where.push('(p.name LIKE ? OR p.description LIKE ? OR p.farmer_name LIKE ?)');
    params.push(...Array(3).fill(`%${req.query.search}%`));
  }
  if (req.query.origin) { where.push('p.origin LIKE ?'); params.push(`%${req.query.origin}%`); }
  if (req.query.category) { where.push('c.slug = ?'); params.push(String(req.query.category)); }
  if (req.query.certification) { where.push('p.certification = ?'); params.push(String(req.query.certification)); }
  for (const key of ['minPrice', 'maxPrice']) {
    if (req.query[key] !== undefined && req.query[key] !== '') {
      const value = Number(req.query[key]);
      if (!Number.isFinite(value) || value < 0) throw new AppError(400, `${key} không hợp lệ`);
      where.push(key === 'minPrice' ? 'p.price >= ?' : 'p.price <= ?');
      params.push(value);
    }
  }
  const order = ({ price_asc: 'p.price ASC', price_desc: 'p.price DESC', name: 'p.name ASC' })[req.query.sort] || 'p.created_at DESC';
  const [rows] = await pool.query(
    `SELECT p.*, c.name category_name, c.slug category_slug,
      COALESCE(AVG(r.rating), 0) rating, COUNT(r.id) reviews
     FROM products p LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN reviews r ON r.product_id = p.id
     WHERE ${where.join(' AND ')} GROUP BY p.id ORDER BY ${order}`,
    params,
  );
  res.json(rows);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const id = positiveInt(req.params.id, 'id');
  const [[product]] = await pool.query(
    `SELECT p.*, c.name category_name, c.slug category_slug,
      COALESCE(AVG(r.rating), 0) rating, COUNT(r.id) reviews
     FROM products p LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN reviews r ON r.product_id = p.id
     WHERE p.id = ? AND p.is_active = 1
       AND (p.seller_id IS NULL OR EXISTS (SELECT 1 FROM seller_profiles sp WHERE sp.user_id = p.seller_id AND sp.status = 'approved'))
     GROUP BY p.id`, [id]);
  if (!product) throw new AppError(404, 'Không tìm thấy sản phẩm');
  res.json(product);
}));

router.post('/', auth(), allowRoles('seller', 'admin', 'manager'), asyncHandler(async (req, res) => {
  const p = req.body;
  if (req.user.role === 'seller') {
    const [[seller]] = await pool.query('SELECT status FROM seller_profiles WHERE user_id = ?', [req.user.id]);
    if (!seller || seller.status !== 'approved') throw new AppError(403, 'Gian hàng cần được quản trị viên duyệt trước khi đăng sản phẩm');
  }
  const name = String(p.name || '').trim();
  const price = Number(p.price);
  const stock = Number(p.stock);
  if (name.length < 2 || name.length > 180 || !Number.isFinite(price) || price <= 0 || !Number.isInteger(stock) || stock < 0) {
    throw new AppError(400, 'Tên, giá và tồn kho sản phẩm không hợp lệ');
  }
  const slug = String(p.slug || name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')).slice(0, 200);
  const sellerId = req.user.role === 'seller' ? req.user.id : (p.seller_id || null);
  const farmerName = sellerId
    ? (await pool.query('SELECT farm_name FROM seller_profiles WHERE user_id = ?', [sellerId]))[0][0]?.farm_name || req.user.name
    : String(p.farmer_name || '').trim();
  const [result] = await pool.query(
    `INSERT INTO products(category_id,name,slug,description,price,unit,stock,origin,farmer_name,image_url,
      traceability_code,seller_id,certification,region,harvest_date,storage_condition)
     VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [p.category_id || null, name, slug, String(p.description || '').slice(0, 5000), price,
      String(p.unit || 'kg').slice(0, 40), stock, String(p.origin || '').slice(0, 160), farmerName,
      String(p.image_url || '').slice(0, 2000), p.traceability_code || `AGR-${Date.now()}`, sellerId,
      p.certification || null, p.region || null, p.harvest_date || null, p.storage_condition || null]);
  res.status(201).json({ id: result.insertId });
}));

router.patch('/:id', auth(), allowRoles('seller', 'admin', 'manager'), asyncHandler(async (req, res) => {
  const id = positiveInt(req.params.id, 'id');
  const p = req.body;
  if (req.user.role === 'seller') {
    const [[owned]] = await pool.query('SELECT id FROM products WHERE id = ? AND seller_id = ?', [id, req.user.id]);
    if (!owned) throw new AppError(404, 'Không tìm thấy sản phẩm');
  }
  const allowed = ['category_id', 'name', 'slug', 'description', 'price', 'unit', 'stock', 'origin', 'image_url', 'traceability_code', 'certification', 'region', 'harvest_date', 'storage_condition'];
  if (req.user.role !== 'seller') allowed.push('is_active');
  const keys = allowed.filter((key) => p[key] !== undefined);
  if (!keys.length) throw new AppError(400, 'Không có trường cần cập nhật');
  if (p.price !== undefined && (!Number.isFinite(Number(p.price)) || Number(p.price) <= 0)) throw new AppError(400, 'Giá không hợp lệ');
  if (p.stock !== undefined && (!Number.isInteger(Number(p.stock)) || Number(p.stock) < 0)) throw new AppError(400, 'Tồn kho không hợp lệ');
  await pool.query(`UPDATE products SET ${keys.map((key) => `${key} = ?`).join(', ')} WHERE id = ?`, [...keys.map((key) => p[key]), id]);
  res.json({ message: 'Đã cập nhật sản phẩm' });
}));

router.delete('/:id', auth(), allowRoles('seller', 'admin'), asyncHandler(async (req, res) => {
  const id = positiveInt(req.params.id, 'id');
  const params = req.user.role === 'seller' ? [id, req.user.id] : [id];
  const [result] = await pool.query(`UPDATE products SET is_active = 0 WHERE id = ?${req.user.role === 'seller' ? ' AND seller_id = ?' : ''}`, params);
  if (!result.affectedRows) throw new AppError(404, 'Không tìm thấy sản phẩm');
  res.json({ message: 'Đã ẩn sản phẩm' });
}));

module.exports = router;
