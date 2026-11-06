/* npm run migrate - nâng cấp schema của Huy (idempotent, chạy lại nhiều lần được). */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

(async () => {
  const db = process.env.DB_NAME || 'agrismart';
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: db,
    multipleStatements: true,
  });
  const hasColumn = async (t, c) => (await conn.query(
    'SELECT 1 FROM information_schema.columns WHERE table_schema=? AND table_name=? AND column_name=?', [db, t, c]))[0].length > 0;
  const addColumn = async (t, c, ddl) => {
    if (await hasColumn(t, c)) return;
    await conn.query(`ALTER TABLE ${t} ADD COLUMN ${c} ${ddl}`);
    console.log(`+ ${t}.${c}`);
  };

  try {
    await addColumn('users', 'ward', 'VARCHAR(120) NULL');
    await addColumn('users', 'district', 'VARCHAR(120) NULL');
    await addColumn('users', 'province', 'VARCHAR(120) NULL');
    await addColumn('users', 'avatar_url', 'TEXT NULL');
    await addColumn('users', 'two_factor_enabled', 'BOOLEAN NOT NULL DEFAULT FALSE');
    await addColumn('users', 'two_factor_secret', 'VARCHAR(64) NULL');
    await addColumn('users', 'two_factor_pending_secret', 'VARCHAR(64) NULL');
    await addColumn('users', 'two_factor_pending_at', 'DATETIME NULL');
    await conn.query('ALTER TABLE users MODIFY COLUMN two_factor_secret TEXT NULL');
    await conn.query('ALTER TABLE users MODIFY COLUMN two_factor_pending_secret TEXT NULL');
    await conn.query("ALTER TABLE users MODIFY COLUMN role ENUM('customer','seller','staff','manager','admin') NOT NULL DEFAULT 'customer'");
    await conn.query(`CREATE TABLE IF NOT EXISTS seller_profiles (
      user_id BIGINT UNSIGNED PRIMARY KEY, farm_name VARCHAR(180) NOT NULL, farm_address VARCHAR(500) NOT NULL,
      status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
      reviewed_at DATETIME NULL, reviewed_by BIGINT UNSIGNED NULL, review_note VARCHAR(1000) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE)`);
    await conn.query("ALTER TABLE seller_profiles MODIFY COLUMN status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending'");
    await addColumn('seller_profiles', 'reviewed_at', 'DATETIME NULL');
    await addColumn('seller_profiles', 'reviewed_by', 'BIGINT UNSIGNED NULL');
    await addColumn('seller_profiles', 'review_note', 'VARCHAR(1000) NULL');
    await addColumn('products', 'low_stock_threshold', 'INT NOT NULL DEFAULT 10');
    await addColumn('products', 'seller_id', 'BIGINT UNSIGNED NULL');
    await addColumn('products', 'certification', 'VARCHAR(80) NULL');
    await addColumn('products', 'region', 'VARCHAR(120) NULL');
    await addColumn('products', 'harvest_date', 'DATE NULL');
    await addColumn('products', 'storage_condition', 'VARCHAR(255) NULL');
    const [sellerFk] = await conn.query("SELECT 1 FROM information_schema.key_column_usage WHERE table_schema=? AND table_name='products' AND column_name='seller_id' AND referenced_table_name='users' AND referenced_column_name='id'", [db]);
    if (!sellerFk.length) await conn.query('ALTER TABLE products ADD CONSTRAINT fk_products_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE SET NULL');
    await addColumn('orders', 'payment_method', "ENUM('cod','card','vnpay','momo','banking') NOT NULL DEFAULT 'cod'");
    await conn.query("ALTER TABLE orders MODIFY COLUMN payment_method ENUM('cod','card','vnpay','momo','banking') NOT NULL DEFAULT 'cod'");
    await addColumn('orders', 'payment_status', "ENUM('unpaid','paid','failed','refunded') NOT NULL DEFAULT 'unpaid'");
    await addColumn('orders', 'payment_ref', 'VARCHAR(60) NULL');
    await addColumn('orders', 'bank_transfer_claimed_at', 'DATETIME NULL');
    await addColumn('orders', 'shipping_fee', 'DECIMAL(12,2) NOT NULL DEFAULT 0');
    await addColumn('orders', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    await addColumn('orders', 'discount_code', 'VARCHAR(40) NULL');
    await addColumn('orders', 'discount_amount', 'DECIMAL(12,2) NOT NULL DEFAULT 0');

    const [chk] = await conn.query(
      "SELECT 1 FROM information_schema.table_constraints WHERE table_schema=? AND table_name='products' AND constraint_name='chk_products_stock_non_negative'", [db]);
    if (!chk.length) {
      try {
        await conn.query('ALTER TABLE products ADD CONSTRAINT chk_products_stock_non_negative CHECK (stock >= 0)');
        console.log('+ CHECK products.stock >= 0');
      } catch (e) {
        console.warn('! Không thêm được CHECK stock >= 0 (có dòng tồn kho âm?):', e.message);
      }
    }

    await conn.query(fs.readFileSync(path.join(__dirname, '../../database/migrations/001_cart_order_inventory_qr.sql'), 'utf8'));
    await conn.query(fs.readFileSync(path.join(__dirname, '../../database/migrations/002_sepay_webhook.sql'), 'utf8'));
    await conn.query(fs.readFileSync(path.join(__dirname, '../../database/migrations/003_checkout_idempotency.sql'), 'utf8'));
    await conn.query(`CREATE TABLE IF NOT EXISTS promotions (
      code VARCHAR(40) PRIMARY KEY, discount_percent DECIMAL(5,2) NOT NULL,
      active BOOLEAN NOT NULL DEFAULT TRUE, starts_at DATETIME NULL, ends_at DATETIME NULL,
      max_uses INT NULL, use_count INT NOT NULL DEFAULT 0,
      CHECK(discount_percent > 0 AND discount_percent <= 100))`);
    await conn.query(`CREATE TABLE IF NOT EXISTS complaints (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL,
      order_id BIGINT UNSIGNED NOT NULL, product_id BIGINT UNSIGNED NULL,
      issue_type VARCHAR(80) NOT NULL, description TEXT NOT NULL, evidence_url TEXT NULL,
      status ENUM('submitted','investigating','resolved','rejected','undetermined') NOT NULL DEFAULT 'submitted',
      staff_note TEXT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL)`);
    console.log('Migrate xong.');
  } finally {
    await conn.end();
  }
})().catch((e) => { console.error(e); process.exit(1); });
