const router = require('express').Router();
const crypto = require('crypto');
const { auth, allowRoles } = require('../middleware');
const AppError = require('../lib/AppError');
const asyncHandler = require('../lib/asyncHandler');
const { positiveInt } = require('../lib/validate');
const pool = require('../db');
const paymentService = require('../services/paymentService');
const { notifyUser } = require('../services/notificationService');

const frontendUrl = () => String(process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
const digitsOnly = (value) => String(value || '').replace(/\D/g, '');

function verifySepaySignature(req) {
  const secret = String(process.env.SEPAY_WEBHOOK_SECRET || '').trim();
  const timestamp = String(req.get('X-SePay-Timestamp') || '').trim();
  const signature = String(req.get('X-SePay-Signature') || '').trim().replace(/^sha256=/i, '');
  if (!secret || !req.rawBody || !/^\d{10,13}$/.test(timestamp) || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  let timestampSeconds = Number(timestamp);
  if (timestampSeconds > 1e12) timestampSeconds = Math.floor(timestampSeconds / 1000);
  if (Math.abs(Date.now() / 1000 - timestampSeconds) > 300) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${req.rawBody.toString('utf8')}`).digest();
  const received = Buffer.from(signature, 'hex');
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

function extractAgriSmartOrderId(payload) {
  const searchable = [payload.code, payload.content, payload.description].filter((value) => typeof value === 'string').join(' ');
  const match = searchable.match(/\bAGRISMART[\s#:_-]*(\d{1,20})\b/i);
  return match ? Number(match[1]) : null;
}

// Public SePay callback. Configure this URL and an HMAC-SHA256 secret in SePay.
router.post('/sepay/webhook', asyncHandler(async (req, res) => {
  if (!String(process.env.SEPAY_WEBHOOK_SECRET || '').trim()) throw new AppError(503, 'Webhook SePay chưa được cấu hình');
  if (!verifySepaySignature(req)) throw new AppError(401, 'Chữ ký webhook SePay không hợp lệ');
  const payload = req.body && typeof req.body === 'object' ? req.body : {};
  const eventId = String(payload.id ?? '').trim();
  if (!eventId || eventId.length > 100) throw new AppError(400, 'Thiếu mã giao dịch SePay');
  const amount = Number(payload.transferAmount ?? payload.amount_in);
  const transactionRef = String(payload.referenceCode || payload.reference_number || eventId).slice(0, 120);
  const orderId = extractAgriSmartOrderId(payload);
  const expectedAccount = digitsOnly(process.env.SEPAY_ACCOUNT_NO || process.env.BANK_ACCOUNT_NO);
  let eventStatus = 'received';
  let matchedOrder = null;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    try {
      await conn.query(`INSERT INTO payment_webhook_events
        (provider,provider_event_id,order_id,transaction_reference,transfer_amount,status,payload)
        VALUES ('sepay',?,?,?,?, 'received',?)`,
      [eventId, null, transactionRef, Number.isFinite(amount) ? amount : null, JSON.stringify(payload)]);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        await conn.rollback();
        return res.json({ success: true, duplicate: true });
      }
      throw error;
    }

    const accountNumber = digitsOnly(payload.accountNumber || payload.account_number);
    if (String(payload.transferType || payload.transfer_type || '').toLowerCase() !== 'in') {
      eventStatus = 'ignored_outgoing';
    } else if (!expectedAccount || !accountNumber || accountNumber !== expectedAccount) {
      eventStatus = 'account_mismatch';
    } else if (!orderId || !Number.isSafeInteger(orderId)) {
      eventStatus = 'unmatched_reference';
    } else if (!Number.isFinite(amount) || amount <= 0) {
      eventStatus = 'invalid_amount';
    } else {
      [[matchedOrder]] = await conn.query(`SELECT id,user_id,status,payment_method,payment_status,total,
        (created_at <= DATE_SUB(NOW(), INTERVAL 5 MINUTE)) AS payment_expired
        FROM orders WHERE id = ? FOR UPDATE`, [orderId]);
      if (!matchedOrder || matchedOrder.payment_method !== 'banking') {
        eventStatus = 'unmatched_reference';
      } else if (matchedOrder.payment_status === 'paid') {
        eventStatus = 'already_paid';
      } else if (matchedOrder.status === 'cancelled' || Number(matchedOrder.payment_expired)) {
        eventStatus = 'late_payment';
      } else if (Math.round(amount) !== Math.round(Number(matchedOrder.total))) {
        eventStatus = 'amount_mismatch';
      } else {
        const paymentRef = `SEPAY-${transactionRef}`.slice(0, 60);
        await conn.query("UPDATE orders SET payment_status='paid',payment_ref=? WHERE id=?", [paymentRef, matchedOrder.id]);
        await notifyUser(conn, matchedOrder.user_id, {
          type: 'payment', title: `Đã nhận thanh toán đơn #${matchedOrder.id}`,
          message: 'SePay đã xác nhận tiền vào đúng số tiền của đơn hàng.', orderId: matchedOrder.id,
        });
        eventStatus = 'paid';
      }
    }

    await conn.query('UPDATE payment_webhook_events SET order_id=?,status=?,processed_at=NOW() WHERE provider=? AND provider_event_id=?',
      [matchedOrder?.id || null, eventStatus, 'sepay', eventId]);
    await conn.commit();
    // SePay requires HTTP 200/201 with JSON { success: true } to acknowledge delivery.
    return res.json({ success: true, status: eventStatus });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}));

router.get('/bank-config', (req, res) => {
  const config = {
    bank_name: process.env.BANK_NAME || '',
    bank_bin: process.env.BANK_BIN || '',
    account_no: process.env.BANK_ACCOUNT_NO || '',
    account_name: process.env.BANK_ACCOUNT_NAME || '',
    branch: process.env.BANK_BRANCH || '',
  };
  res.json({ ...config, configured: Boolean(config.bank_name && config.bank_bin && config.account_no && config.account_name) });
});

router.post('/bank/:orderId/claim', auth(), asyncHandler(async (req, res) => {
  const orderId = positiveInt(req.params.orderId, 'orderId');
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[order]] = await conn.query(`SELECT id, user_id, status, payment_method, payment_status,
      (created_at <= DATE_SUB(NOW(), INTERVAL 5 MINUTE)) AS payment_expired FROM orders WHERE id = ? FOR UPDATE`, [orderId]);
    if (!order) throw new AppError(404, 'Không tìm thấy đơn hàng');
    if (Number(order.user_id) !== Number(req.user.id)) throw new AppError(403, 'Đơn hàng không thuộc tài khoản của bạn');
    if (order.payment_method !== 'banking') throw new AppError(400, 'Đơn này không thanh toán bằng chuyển khoản ngân hàng');
    if (order.status === 'cancelled') throw new AppError(400, 'Đơn hàng đã bị hủy');
    if (order.payment_status === 'paid') {
      await conn.commit();
      return res.json({ id: orderId, payment_status: 'paid', claimed: false, message: 'Đơn hàng đã được xác nhận thanh toán' });
    }
    if (Number(order.payment_expired)) throw new AppError(409, 'Đã quá 5 phút thanh toán; đơn hàng đang được tự động hủy');
    await conn.query('UPDATE orders SET bank_transfer_claimed_at = COALESCE(bank_transfer_claimed_at, NOW()) WHERE id = ?', [orderId]);
    await conn.commit();
    res.json({ id: orderId, payment_status: 'unpaid', claimed: true, message: 'Đã ghi nhận bạn báo đã chuyển khoản; đơn đang chờ đối soát' });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}));

router.patch('/bank/:orderId/confirm', auth(), allowRoles('staff', 'manager', 'admin'), asyncHandler(async (req, res) => {
  const orderId = positiveInt(req.params.orderId, 'orderId');
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[order]] = await conn.query(`SELECT id, status, payment_method, payment_status,
      (created_at <= DATE_SUB(NOW(), INTERVAL 5 MINUTE)) AS payment_expired FROM orders WHERE id = ? FOR UPDATE`, [orderId]);
    if (!order) throw new AppError(404, 'Không tìm thấy đơn hàng');
    if (order.payment_method !== 'banking') throw new AppError(400, 'Đơn này không thanh toán bằng chuyển khoản ngân hàng');
    if (order.status === 'cancelled') throw new AppError(400, 'Không thể xác nhận thanh toán cho đơn đã hủy');
    if (Number(order.payment_expired) && order.payment_status !== 'paid') throw new AppError(409, 'Đã quá 5 phút thanh toán; không thể xác nhận đơn này');
    if (order.payment_status !== 'paid') {
      await conn.query("UPDATE orders SET payment_status = 'paid', payment_ref = ? WHERE id = ?", [`BANK-MANUAL-${orderId}`, orderId]);
    }
    await conn.commit();
    res.json({ id: orderId, payment_status: 'paid', message: 'Đã xác nhận nhận tiền chuyển khoản' });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}));

router.post('/create/:orderId', auth(), asyncHandler(async (req, res) => {
  const provider = String(req.body.provider || '').toLowerCase();
  if (!['vnpay', 'momo'].includes(provider)) throw new AppError(400, 'Cổng thanh toán không hợp lệ');
  const result = await paymentService.createPayment(positiveInt(req.params.orderId, 'orderId'), req.user, provider, req.ip);
  res.json(result);
}));

router.get('/vnpay/return', asyncHandler(async (req, res) => {
  const params = req.query;
  if (!paymentService.verifyVnpay(params)) return res.redirect(`${frontendUrl()}/?payment_result=invalid_signature`);
  let orderId = '';
  try {
    orderId = String(await paymentService.applyProviderResult({
      provider: 'vnpay', reference: String(params.vnp_TxnRef), amount: Number(params.vnp_Amount) / 100,
      success: params.vnp_ResponseCode === '00' && params.vnp_TransactionStatus === '00',
      transactionId: String(params.vnp_TransactionNo || ''),
    }));
  } catch { return res.redirect(`${frontendUrl()}/?payment_result=error`); }
  const result = params.vnp_ResponseCode === '00' && params.vnp_TransactionStatus === '00' ? 'success' : 'failed';
  res.redirect(`${frontendUrl()}/?payment_result=${result}&order_id=${encodeURIComponent(orderId)}`);
}));

router.get('/vnpay/ipn', asyncHandler(async (req, res) => {
  const params = req.query;
  if (!paymentService.verifyVnpay(params)) return res.json({ RspCode: '97', Message: 'Invalid signature' });
  try {
    await paymentService.applyProviderResult({
      provider: 'vnpay', reference: String(params.vnp_TxnRef), amount: Number(params.vnp_Amount) / 100,
      success: params.vnp_ResponseCode === '00' && params.vnp_TransactionStatus === '00',
      transactionId: String(params.vnp_TransactionNo || ''),
    });
    return res.json({ RspCode: '00', Message: 'Confirm Success' });
  } catch (error) {
    return res.json({ RspCode: error.status === 404 ? '01' : '04', Message: 'Order data mismatch' });
  }
}));

router.post('/momo/ipn', asyncHandler(async (req, res) => {
  const data = req.body;
  if (!paymentService.verifyMomo(data)) return res.status(400).json({ message: 'Invalid signature' });
  await paymentService.applyProviderResult({
    provider: 'momo', reference: String(data.orderId), amount: Number(data.amount),
    success: Number(data.resultCode) === 0, transactionId: String(data.transId || ''),
  });
  return res.status(204).end();
}));

router.get('/momo/return', asyncHandler(async (req, res) => {
  const data = req.query;
  if (!paymentService.verifyMomo(data)) return res.redirect(`${frontendUrl()}/?payment_result=invalid_signature`);
  let orderId = '';
  try {
    orderId = String(await paymentService.applyProviderResult({
      provider: 'momo', reference: String(data.orderId), amount: Number(data.amount),
      success: Number(data.resultCode) === 0, transactionId: String(data.transId || ''),
    }));
  } catch { return res.redirect(`${frontendUrl()}/?payment_result=error`); }
  const result = Number(data.resultCode) === 0 ? 'success' : 'failed';
  res.redirect(`${frontendUrl()}/?payment_result=${result}&order_id=${encodeURIComponent(orderId)}`);
}));

module.exports = router;
