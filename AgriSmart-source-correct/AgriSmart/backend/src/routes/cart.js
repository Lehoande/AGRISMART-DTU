const router = require('express').Router();
const pool = require('../db');
const { auth } = require('../middleware');
const AppError = require('../lib/AppError');
const asyncHandler = require('../lib/asyncHandler');
const { positiveInt } = require('../lib/validate');

router.use(auth());

// GET /api/cart  (giữ nguyên dạng mảng như contract cũ)
router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.id product_id, p.name, p.price, p.unit, p.stock, p.image_url, ci.quantity,
            p.price * ci.quantity line_total, (ci.quantity > p.stock) AS exceeds_stock
     FROM cart_items ci JOIN products p ON p.id = ci.product_id WHERE ci.user_id = ? ORDER BY ci.id`, [req.user.id]);
  res.json(rows.map((r) => ({ ...r, exceeds_stock: Boolean(r.exceeds_stock) })));
}));

// POST /api/cart { productId, quantity }  -> cộng dồn số lượng
router.post('/', asyncHandler(async (req, res) => {
  const productId = positiveInt(req.body.productId, 'productId');
  const quantity = positiveInt(req.body.quantity ?? 1, 'quantity');
  const [[p]] = await pool.query('SELECT id, stock, is_active FROM products WHERE id = ?', [productId]);
  if (!p || !p.is_active) throw new AppError(404, 'Product not found');

  const [[cur]] = await pool.query('SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?', [req.user.id, productId]);
  const newQty = (cur ? cur.quantity : 0) + quantity;
  if (newQty > p.stock) throw new AppError(400, `Not enough stock (còn ${p.stock})`);

  await pool.query(
    'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?,?,?) ON DUPLICATE KEY UPDATE quantity = ?',
    [req.user.id, productId, newQty, newQty]);
  res.status(201).json({ message: 'Added to cart', quantity: newQty });
}));

// PATCH /api/cart/:productId { quantity }  -> đặt số lượng tuyệt đối
router.patch('/:productId', asyncHandler(async (req, res) => {
  const productId = positiveInt(req.params.productId, 'productId');
  const quantity = positiveInt(req.body.quantity, 'quantity');
  const [[p]] = await pool.query('SELECT stock FROM products WHERE id = ? AND is_active = 1', [productId]);
  if (!p) throw new AppError(404, 'Product not found');
  if (quantity > p.stock) throw new AppError(400, `Quantity exceeds stock (còn ${p.stock})`);
  const [r] = await pool.query('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?', [quantity, req.user.id, productId]);
  if (!r.affectedRows) throw new AppError(404, 'Sản phẩm chưa có trong giỏ');
  res.json({ message: 'Cart updated' });
}));

// DELETE /api/cart/:productId
router.delete('/:productId', asyncHandler(async (req, res) => {
  const productId = positiveInt(req.params.productId, 'productId');
  await pool.query('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [req.user.id, productId]);
  res.json({ message: 'Removed' });
}));

// DELETE /api/cart  -> xoá cả giỏ
router.delete('/', asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
  res.json({ message: 'Cart cleared' });
}));

module.exports = router;
