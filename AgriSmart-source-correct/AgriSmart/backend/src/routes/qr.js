const router = require('express').Router();
const crypto = require('crypto');
const QRCode = require('qrcode');
const pool = require('../db');
const { auth, allowRoles } = require('../middleware');
const AppError = require('../lib/AppError');
const asyncHandler = require('../lib/asyncHandler');
const { positiveInt } = require('../lib/validate');

const STAFF = ['staff', 'manager', 'admin'];
const traceUrl = (code) => `${process.env.TRACE_BASE_URL || 'http://localhost:4000/api/qr/trace'}/${code}`;
const newBatchCode = () => `BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

// POST /api/qr/batches { productId, harvestDate, qualityStandard?, notes? }  -> sinh lô + mã QR (base64 PNG)
router.post('/batches', auth(), allowRoles(...STAFF), asyncHandler(async (req, res) => {
  const productId = positiveInt(req.body.productId, 'productId');
  const { harvestDate, qualityStandard, notes } = req.body;
  if (!harvestDate || Number.isNaN(Date.parse(harvestDate))) throw new AppError(400, 'harvestDate phải là ngày hợp lệ (YYYY-MM-DD)');
  const [[p]] = await pool.query('SELECT id FROM products WHERE id = ?', [productId]);
  if (!p) throw new AppError(404, 'Product not found');

  const batch_code = newBatchCode();
  await pool.query(
    'INSERT INTO product_batches (batch_code, product_id, harvest_date, quality_standard, notes, created_by) VALUES (?,?,?,?,?,?)',
    [batch_code, productId, harvestDate, qualityStandard || null, notes || null, req.user.id]);
  res.status(201).json({ batch_code, trace_url: traceUrl(batch_code), qr_data_url: await QRCode.toDataURL(traceUrl(batch_code), { width: 320, margin: 2 }) });
}));

// GET /api/qr/batches?productId=
router.get('/batches', auth(), allowRoles(...STAFF), asyncHandler(async (req, res) => {
  const params = [];
  let where = '';
  if (req.query.productId) { where = 'WHERE b.product_id = ?'; params.push(positiveInt(req.query.productId, 'productId')); }
  const [rows] = await pool.query(
    `SELECT b.batch_code, p.name AS product_name, p.origin, p.farmer_name, b.harvest_date, b.quality_standard, b.created_at
     FROM product_batches b JOIN products p ON p.id = b.product_id ${where} ORDER BY b.id DESC LIMIT 200`, params);
  res.json(rows);
}));

// GET /api/qr/image/:code  -> PNG để in tem (hỗ trợ cả mã sản phẩm AGR-xxx)
router.get('/image/:code', auth(), allowRoles(...STAFF), asyncHandler(async (req, res) => {
  const [[b]] = await pool.query(
    `SELECT batch_code AS code FROM product_batches WHERE batch_code = ?
     UNION SELECT traceability_code FROM products WHERE traceability_code = ?`, [req.params.code, req.params.code]);
  if (!b) throw new AppError(404, 'Không tìm thấy mã');
  res.type('png').send(await QRCode.toBuffer(traceUrl(b.code), { width: 512, margin: 2 }));
}));

// GET /api/qr/trace/:code  (PUBLIC) - app mobile quét QR rồi gọi. Nhận batch_code HOẶC traceability_code của sản phẩm.
router.get('/trace/:code', asyncHandler(async (req, res) => {
  const cols = `p.id AS product_id, p.name AS product_name, p.description, p.price, p.unit, p.stock, p.origin, p.farmer_name, p.traceability_code, p.image_url, c.name AS category_name`;
  const [[batch]] = await pool.query(
    `SELECT b.batch_code, b.harvest_date, b.quality_standard, b.notes, ${cols}
     FROM product_batches b JOIN products p ON p.id = b.product_id LEFT JOIN categories c ON c.id = p.category_id WHERE b.batch_code = ?`, [req.params.code]);
  if (batch) return res.json(batch);

  const [[prod]] = await pool.query(
    `SELECT (SELECT b.batch_code FROM product_batches b WHERE b.product_id = p.id ORDER BY b.id DESC LIMIT 1) AS batch_code,
            (SELECT b.harvest_date FROM product_batches b WHERE b.product_id = p.id ORDER BY b.id DESC LIMIT 1) AS harvest_date,
            (SELECT b.quality_standard FROM product_batches b WHERE b.product_id = p.id ORDER BY b.id DESC LIMIT 1) AS quality_standard,
            NULL AS notes, ${cols}
     FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.traceability_code = ? AND p.is_active = 1`, [req.params.code]);
  if (!prod) throw new AppError(404, 'Mã QR không hợp lệ hoặc lô hàng không tồn tại');
  res.json(prod);
}));

module.exports = router;
