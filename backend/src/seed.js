require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

async function main() {
  const { BOOTSTRAP_ADMIN_NAME, BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_PASSWORD } = process.env;
  if (!BOOTSTRAP_ADMIN_NAME || !BOOTSTRAP_ADMIN_EMAIL || !BOOTSTRAP_ADMIN_PASSWORD || BOOTSTRAP_ADMIN_PASSWORD.length < 12) {
    throw new Error('Set BOOTSTRAP_ADMIN_NAME, BOOTSTRAP_ADMIN_EMAIL and a BOOTSTRAP_ADMIN_PASSWORD of at least 12 characters; no demo account is created.');
  }
  const email = BOOTSTRAP_ADMIN_EMAIL.trim().toLowerCase();
  const [[existing]] = await pool.query('SELECT id, role FROM users WHERE email = ?', [email]);
  if (existing) {
    if (existing.role !== 'admin') throw new Error('The bootstrap email already belongs to a non-admin account; no account was changed.');
    console.log('Bootstrap admin already exists; no account changes made.');
    return;
  }
  const passwordHash = await bcrypt.hash(BOOTSTRAP_ADMIN_PASSWORD, 12);
  await pool.query('INSERT INTO users(name, email, password_hash, role) VALUES(?,?,?,\'admin\')', [BOOTSTRAP_ADMIN_NAME.trim(), email, passwordHash]);
  console.log(`Created initial admin account: ${email}`);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => pool.end());
