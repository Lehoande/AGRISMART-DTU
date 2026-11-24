/* npm run seed:demo - tài khoản staff/manager, 50 khách test tải, sản phẩm "hàng hiếm", lô QR. Chạy lại được. */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

const LOAD_USERS = 50;
const SCARCE = 'Dâu tây Đà Lạt (test race)';

(async () => {
  try {
    if (process.env.NODE_ENV === 'production' || process.env.ALLOW_DEMO_SEED !== 'true') {
      throw new Error('Demo fixtures are disabled by default. Set ALLOW_DEMO_SEED=true only for a disposable development/test database.');
    }
    const [staffH, mgrH, loadH] = await Promise.all([bcrypt.hash('Staff123!', 10), bcrypt.hash('Manager123!', 10), bcrypt.hash('Test@1234', 10)]);
    const users = [
      ['Nhân viên Lan', 'staff@agrismart.local', staffH, 'staff'],
      ['Quản lý Minh', 'manager@agrismart.local', mgrH, 'manager'],
    ];
    for (let i = 1; i <= LOAD_USERS; i++) users.push([`Load User ${i}`, `load${String(i).padStart(2, '0')}@test.com`, loadH, 'customer']);
    await pool.query('INSERT INTO users (name, email, password_hash, role) VALUES ? ON DUPLICATE KEY UPDATE name = VALUES(name)', [users]);

    // [slug, name, category slug, price, unit, stock, threshold, origin, farmer, code]
    const demo = [
      ['dau-tay-test-race', SCARCE, 'trai-cay', 120000, 'kg', 5, 3, 'Đà Lạt, Lâm Đồng', 'Nông trại Langbiang', 'AGR-FRU-0101'],
      ['nam-huong-tuoi', 'Nấm hương tươi', 'nong-san-khac', 150000, 'kg', 8, 10, 'Lâm Đồng', 'HTX Nấm Xanh', 'AGR-OTH-0102'], // dưới ngưỡng => demo cảnh báo
    ];
    for (const d of demo) {
      await pool.query(
        `INSERT INTO products (category_id, slug, name, price, unit, stock, low_stock_threshold, origin, farmer_name, traceability_code, description)
         VALUES ((SELECT id FROM categories WHERE slug = ?), ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Dữ liệu demo')
         ON DUPLICATE KEY UPDATE stock = VALUES(stock), low_stock_threshold = VALUES(low_stock_threshold), is_active = 1`,
        [d[2], d[0], d[1], d[3], d[4], d[5], d[6], d[7], d[8], d[9]]);
    }
    await pool.query(
      `INSERT IGNORE INTO product_batches (batch_code, product_id, harvest_date, quality_standard, notes)
       SELECT CONCAT('BATCH-SEED-', LPAD(id, 4, '0')), id, CURDATE() - INTERVAL 2 DAY, 'VietGAP', 'Dữ liệu seed' FROM products WHERE is_active = 1`);

    console.log('Seed demo xong.');
    console.log('staff@agrismart.local / Staff123!  |  manager@agrismart.local / Manager123!');
    console.log(`Test đồng thời: load01..load${LOAD_USERS}@test.com / Test@1234, sản phẩm "${SCARCE}"`);
  } catch (e) { console.error(e); process.exitCode = 1; } finally { await pool.end(); }
})();
