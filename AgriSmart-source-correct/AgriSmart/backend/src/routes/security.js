const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const { auth } = require('../middleware');

const router = express.Router();
const run = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const check = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  next();
};
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const encryptionKey = () => crypto.createHash('sha256').update(String(process.env.JWT_SECRET || '')).digest();

function encryptSecret(secret) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  return `${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${encrypted.toString('base64url')}`;
}

function decryptSecret(value) {
  const [iv, tag, encrypted] = String(value || '').split('.');
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64url')), decipher.final()]).toString('utf8');
}

function encodeBase32(bytes) {
  let bits = 0, value = 0, output = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) { output += alphabet[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits) output += alphabet[(value << (5 - bits)) & 31];
  return output;
}

function decodeBase32(text) {
  let bits = 0, value = 0;
  const output = [];
  for (const char of text.toUpperCase().replace(/=+$/, '')) {
    const index = alphabet.indexOf(char);
    if (index < 0) throw new Error('Invalid authenticator secret');
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) { output.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(output);
}

function verifyTotp(secret, code) {
  if (!/^\d{6}$/.test(String(code || ''))) return false;
  const key = decodeBase32(secret);
  const now = Math.floor(Date.now() / 1000 / 30);
  for (let offset = -1; offset <= 1; offset += 1) {
    const counter = Buffer.alloc(8);
    counter.writeBigUInt64BE(BigInt(now + offset));
    const digest = crypto.createHmac('sha1', key).update(counter).digest();
    const at = digest[digest.length - 1] & 0x0f;
    const value = (digest.readUInt32BE(at) & 0x7fffffff) % 1000000;
    const expected = String(value).padStart(6, '0');
    if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(code)))) return true;
  }
  return false;
}

router.patch('/password', auth(), [
  body('current_password').isString().notEmpty(),
  body('new_password').isString().isLength({ min: 8, max: 128 }),
], check, run(async (req, res) => {
  const [rows] = await pool.query('SELECT password_hash FROM users WHERE id=?', [req.user.id]);
  const user = rows[0];
  if (!user || !await bcrypt.compare(req.body.current_password, user.password_hash)) {
    return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng.' });
  }
  if (req.body.current_password === req.body.new_password) {
    return res.status(400).json({ message: 'Mật khẩu mới phải khác mật khẩu hiện tại.' });
  }
  const hash = await bcrypt.hash(req.body.new_password, 12);
  await pool.query('UPDATE users SET password_hash=? WHERE id=?', [hash, req.user.id]);
  res.json({ message: 'Đã đổi mật khẩu.' });
}));

router.get('/2fa', auth(), run(async (req, res) => {
  const [rows] = await pool.query('SELECT two_factor_enabled FROM users WHERE id=?', [req.user.id]);
  res.json({ enabled: Boolean(rows[0]?.two_factor_enabled) });
}));

router.post('/2fa/setup', auth(), run(async (req, res) => {
  const secret = encodeBase32(crypto.randomBytes(20));
  const [rows] = await pool.query('SELECT email FROM users WHERE id=?', [req.user.id]);
  if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
  await pool.query('UPDATE users SET two_factor_pending_secret=?, two_factor_pending_at=NOW() WHERE id=?', [encryptSecret(secret), req.user.id]);
  const label = encodeURIComponent(`AgriSmart:${rows[0].email}`);
  const uri = `otpauth://totp/${label}?secret=${secret}&issuer=AgriSmart&algorithm=SHA1&digits=6&period=30`;
  res.json({ secret, qr_code: await QRCode.toDataURL(uri), expires_in_minutes: 10 });
}));

router.post('/2fa/enable', auth(), [body('code').matches(/^\d{6}$/)], check, run(async (req, res) => {
  const [rows] = await pool.query('SELECT two_factor_pending_secret, two_factor_pending_at FROM users WHERE id=?', [req.user.id]);
  const user = rows[0];
  if (!user?.two_factor_pending_secret || !user.two_factor_pending_at || Date.now() - new Date(user.two_factor_pending_at).getTime() > 10 * 60 * 1000) {
    return res.status(400).json({ message: 'Mã thiết lập đã hết hạn. Hãy tạo mã QR mới.' });
  }
  if (!verifyTotp(decryptSecret(user.two_factor_pending_secret), req.body.code)) return res.status(400).json({ message: 'Mã xác thực không đúng hoặc đã hết hạn.' });
  await pool.query('UPDATE users SET two_factor_secret=two_factor_pending_secret, two_factor_pending_secret=NULL, two_factor_pending_at=NULL, two_factor_enabled=1 WHERE id=?', [req.user.id]);
  res.json({ enabled: true, message: 'Đã bật xác thực hai bước.' });
}));

router.post('/2fa/disable', auth(), [body('password').isString().notEmpty(), body('code').matches(/^\d{6}$/)], check, run(async (req, res) => {
  const [rows] = await pool.query('SELECT password_hash,two_factor_secret,two_factor_enabled FROM users WHERE id=?', [req.user.id]);
  const user = rows[0];
  if (!user || !await bcrypt.compare(req.body.password, user.password_hash)) return res.status(400).json({ message: 'Mật khẩu không đúng.' });
  if (!user.two_factor_enabled || !verifyTotp(decryptSecret(user.two_factor_secret), req.body.code)) return res.status(400).json({ message: 'Mã xác thực không đúng.' });
  await pool.query('UPDATE users SET two_factor_enabled=0,two_factor_secret=NULL,two_factor_pending_secret=NULL,two_factor_pending_at=NULL WHERE id=?', [req.user.id]);
  res.json({ enabled: false, message: 'Đã tắt xác thực hai bước.' });
}));

router.post('/2fa/verify', [body('challenge_token').isString().notEmpty(), body('code').matches(/^\d{6}$/)], check, run(async (req, res) => {
  let challenge;
  try { challenge = jwt.verify(req.body.challenge_token, process.env.JWT_SECRET); }
  catch { return res.status(401).json({ message: 'Phiên xác thực đã hết hạn. Hãy đăng nhập lại.' }); }
  if (challenge.purpose !== '2fa-login' || !challenge.sub) return res.status(401).json({ message: 'Phiên xác thực không hợp lệ.' });
  const [rows] = await pool.query('SELECT id,name,email,role,two_factor_secret,two_factor_enabled FROM users WHERE id=?', [challenge.sub]);
  const user = rows[0];
  if (!user?.two_factor_enabled || !verifyTotp(decryptSecret(user.two_factor_secret), req.body.code)) return res.status(401).json({ message: 'Mã xác thực không đúng.' });
  const publicUser = { id: user.id, name: user.name, email: user.email, role: user.role };
  res.json({ token: jwt.sign(publicUser, process.env.JWT_SECRET, { expiresIn: '7d' }), user: publicUser });
}));

module.exports = router;
