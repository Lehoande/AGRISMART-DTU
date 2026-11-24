const AppError = require('./AppError');

// eslint-disable-next-line no-unused-vars
module.exports = (e, req, res, next) => {
  if (e instanceof AppError) return res.status(e.status).json({ message: e.message, details: e.details });
  if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Duplicate value' });
  if (e.code === 'ER_LOCK_DEADLOCK' || e.code === 'ER_LOCK_WAIT_TIMEOUT') {
    return res.status(503).json({ message: 'Hệ thống đang bận, vui lòng thử lại' });
  }
  if (e.code === 'ER_CHECK_CONSTRAINT_VIOLATED' || e.code === 'ER_CONSTRAINT_FAILED') {
    return res.status(409).json({ message: 'Không đủ hàng trong kho' });
  }
  console.error(e);
  return res.status(500).json({ message: process.env.NODE_ENV === 'production' ? 'Internal server error' : e.message });
};
