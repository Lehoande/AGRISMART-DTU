const router = require('express').Router();
const pool = require('../db');
const AppError = require('../lib/AppError');
const asyncHandler = require('../lib/asyncHandler');

router.get('/:code', asyncHandler(async (req, res) => {
  const code = String(req.params.code || '').trim().toUpperCase();
  const [[promotion]] = await pool.query(
    `SELECT code, discount_percent FROM promotions WHERE code = ? AND active = 1
     AND (starts_at IS NULL OR starts_at <= NOW()) AND (ends_at IS NULL OR ends_at >= NOW())
     AND (max_uses IS NULL OR use_count < max_uses)`, [code]);
  if (!promotion) throw new AppError(404, 'Mã giảm giá không hợp lệ hoặc đã hết hạn');
  res.json(promotion);
}));

module.exports = router;
