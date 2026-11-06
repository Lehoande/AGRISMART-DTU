
require('dotenv').config({ path: './backend/.env' });

const pool = require('./src/db');

async function checkDatabase() {
  try {
    const [rows] = await pool.query('SHOW DATABASES');
    console.table(rows);
    console.log('Ket noi MySQL thanh cong!');
  } catch (error) {
    console.error('Ma loi:', error.code);
    console.error('Chi tiet:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();
