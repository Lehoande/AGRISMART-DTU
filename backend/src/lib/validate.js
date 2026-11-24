const AppError = require('./AppError');

const positiveInt = (v, field) => {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new AppError(400, `${field} phải là số nguyên dương`);
  return n;
};

module.exports = { positiveInt };
