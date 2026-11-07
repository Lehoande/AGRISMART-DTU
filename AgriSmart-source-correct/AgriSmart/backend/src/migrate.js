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
    await addColumn('products', 'low_stock_threshold', 'INT NOT NULL DEFAULT 10');
    await addColumn('orders', 'payment_method', "ENUM('cod','card') NOT NULL DEFAULT 'cod'");
    await addColumn('orders', 'payment_status', "ENUM('unpaid','paid','failed','refunded') NOT NULL DEFAULT 'unpaid'");
    await addColumn('orders', 'payment_ref', 'VARCHAR(60) NULL');
    await addColumn('orders', 'shipping_fee', 'DECIMAL(12,2) NOT NULL DEFAULT 0');
    await addColumn('orders', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

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
    console.log('Migrate xong.');
  } finally {
    await conn.end();
  }
})().catch((e) => { console.error(e); process.exit(1); });
