const crypto = require('crypto');
const querystring = require('querystring');
const pool = require('../db');
const AppError = require('../lib/AppError');

const constantTimeEqual = (left, right) => {
  const a = Buffer.from(String(left || ''), 'hex');
  const b = Buffer.from(String(right || ''), 'hex');
  return a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b);
};
const sign = (secret, value, algorithm = 'sha256') => crypto.createHmac(algorithm, secret).update(value, 'utf8').digest('hex');
const sortedQuery = (params) => querystring.stringify(Object.fromEntries(Object.entries(params).sort(([a], [b]) => a.localeCompare(b))));
const momoString = (fields, data) => fields.map((key) => `${key}=${data[key] ?? ''}`).join('&');
const vnpDate = (date) => new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
}).format(date).replace(/[^0-9]/g, '');

async function createPayment(orderId, user, provider, clientIp) {
  const [[order]] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, user.id]);
  if (!order) throw new AppError(404, 'Không tìm thấy đơn hàng');
  if (order.status !== 'pending') throw new AppError(409, 'Đơn hàng không còn chờ thanh toán');
  if (order.payment_status === 'paid') throw new AppError(409, 'Đơn hàng đã thanh toán');
  if (order.payment_method !== provider) throw new AppError(400, 'Cổng thanh toán không khớp với phương thức của đơn hàng');

  const now = Date.now();
  const reference = `AGRI${order.id}${now}`;
  const amount = Math.round(Number(order.total));
  const apiBase = String(process.env.PUBLIC_API_URL || '').replace(/\/$/, '');
  const frontend = String(process.env.FRONTEND_URL || '').replace(/\/$/, '');
  if (!apiBase || !frontend) throw new AppError(503, 'Cần cấu hình PUBLIC_API_URL và FRONTEND_URL để nhận kết quả thanh toán');

  if (provider === 'vnpay') {
    const tmnCode = process.env.VNPAY_TMN_CODE;
    const hashSecret = process.env.VNPAY_HASH_SECRET;
    if (!tmnCode || !hashSecret) throw new AppError(503, 'Chưa cấu hình thông tin merchant VNPay sandbox');
    const createDate = vnpDate(new Date(now));
    const expireDate = vnpDate(new Date(now + 15 * 60 * 1000));
    const params = {
      vnp_Version: '2.1.0', vnp_Command: 'pay', vnp_TmnCode: tmnCode,
      vnp_Amount: String(amount * 100), vnp_CurrCode: 'VND', vnp_TxnRef: reference,
      vnp_OrderInfo: `Thanh toan don hang ${order.id}`, vnp_OrderType: 'other',
      vnp_Locale: 'vn', vnp_ReturnUrl: `${apiBase}/payments/vnpay/return`,
      vnp_IpAddr: String(clientIp || '127.0.0.1').replace(/^::ffff:/, '') || '127.0.0.1',
      vnp_CreateDate: createDate, vnp_ExpireDate: expireDate,
    };
    params.vnp_SecureHash = sign(hashSecret, sortedQuery(params), 'sha512');
    await pool.query('UPDATE orders SET payment_ref = ?, payment_status = \'unpaid\' WHERE id = ?', [reference, order.id]);
    return { payment_url: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?${sortedQuery(params)}` };
  }

  if (provider === 'momo') {
    const { MOMO_PARTNER_CODE: partnerCode, MOMO_ACCESS_KEY: accessKey, MOMO_SECRET_KEY: secretKey } = process.env;
    if (!partnerCode || !accessKey || !secretKey) throw new AppError(503, 'Chưa cấu hình thông tin merchant MoMo sandbox');
    const requestId = reference;
    const extraData = '';
    const fields = ['accessKey','amount','extraData','ipnUrl','orderId','orderInfo','partnerCode','redirectUrl','requestId','requestType'];
    const data = {
      partnerCode, accessKey, requestId, amount: String(amount), orderId: reference,
      orderInfo: `Thanh toan don hang ${order.id}`, redirectUrl: `${apiBase}/payments/momo/return`,
      ipnUrl: `${apiBase}/payments/momo/ipn`, requestType: 'captureWallet', extraData, lang: 'vi',
    };
    data.signature = sign(secretKey, momoString(fields, data));
    await pool.query('UPDATE orders SET payment_ref = ?, payment_status = \'unpaid\' WHERE id = ?', [reference, order.id]);
    let response;
    try {
      const result = await fetch(`${process.env.MOMO_API_BASE || 'https://test-payment.momo.vn'}/v2/gateway/api/create`, {
        method: 'POST', headers: { 'Content-Type': 'application/json; charset=UTF-8' }, body: JSON.stringify(data),
      });
      response = await result.json();
    } catch { throw new AppError(502, 'Không kết nối được MoMo sandbox'); }
    if (!response.payUrl || Number(response.resultCode) !== 0) throw new AppError(502, response.message || 'MoMo không tạo được liên kết thanh toán');
    return { payment_url: response.payUrl };
  }
  throw new AppError(400, 'Cổng thanh toán không được hỗ trợ');
}

function verifyVnpay(params) {
  const hashSecret = process.env.VNPAY_HASH_SECRET;
  if (!hashSecret || !params.vnp_SecureHash) return false;
  const data = { ...params };
  delete data.vnp_SecureHash;
  delete data.vnp_SecureHashType;
  return constantTimeEqual(params.vnp_SecureHash, sign(hashSecret, sortedQuery(data), 'sha512'));
}

function verifyMomo(data) {
  const secretKey = process.env.MOMO_SECRET_KEY;
  if (!secretKey || !data.signature) return false;
  const fields = ['accessKey','amount','extraData','message','orderId','orderInfo','orderType','partnerCode','payType','requestId','responseTime','resultCode','transId'];
  return constantTimeEqual(data.signature, sign(secretKey, momoString(fields, data)));
}

async function applyProviderResult({ provider, reference, amount, success, transactionId }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[order]] = await conn.query('SELECT id, total, payment_method, payment_status, payment_ref FROM orders WHERE payment_ref = ? FOR UPDATE', [reference]);
    if (!order) throw new AppError(404, 'Không tìm thấy giao dịch');
    if (order.payment_method !== provider || Math.round(Number(order.total)) !== Number(amount)) throw new AppError(400, 'Thông tin giao dịch không khớp đơn hàng');
    if (order.payment_status !== 'paid') {
      const status = success ? 'paid' : 'failed';
      await conn.query('UPDATE orders SET payment_status = ? WHERE id = ?', [status, order.id]);
    }
    await conn.commit();
    return order.id;
  } catch (error) { await conn.rollback(); throw error; }
  finally { conn.release(); }
}

module.exports = { createPayment, verifyVnpay, verifyMomo, applyProviderResult };
