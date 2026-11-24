/*
 * Test chống over-selling (rủi ro R1).
 * Chuẩn bị: npm run migrate && npm run seed:demo && npm start   |   Chạy: npm run test:concurrency
 * Kịch bản: đặt tồn kho = 5, N khách cùng checkout 1 món -> đúng 5 đơn thành công, tồn kho cuối = 0.
 */
const BASE = process.env.BASE_URL || 'http://localhost:4000/api';
const N = Number(process.env.N || 50);
const STOCK = Number(process.env.STOCK || 5);
const SCARCE = 'Dâu tây Đà Lạt (test race)';

async function api(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* no body */ }
  return { status: res.status, data };
}

async function login(email, password) {
  const r = await api('/auth/login', { method: 'POST', body: { email, password } });
  if (r.status !== 200) throw new Error(`Login thất bại (${email}): ${JSON.stringify(r.data)}`);
  return r.data.token;
}

async function findProduct(token) {
  const r = await api(`/inventory?search=${encodeURIComponent(SCARCE)}`, { token });
  const p = r.data && r.data.items && r.data.items.find((i) => i.name === SCARCE);
  if (!p) throw new Error('Không thấy sản phẩm test. Hãy chạy npm run seed:demo');
  return p;
}

(async () => {
  const staff = await login('staff@agrismart.local', 'Staff123!');
  const product = await findProduct(staff);
  await api(`/inventory/${product.id}/stock`, { method: 'PATCH', token: staff, body: { stock: STOCK, reason: 'Reset trước test đồng thời' } });
  console.log(`Tồn kho ban đầu: ${STOCK} | khách đồng thời: ${N}`);

  const tokens = await Promise.all(Array.from({ length: N }, (_, i) => login(`load${String(i + 1).padStart(2, '0')}@test.com`, 'Test@1234')));
  await Promise.all(tokens.map(async (t) => {
    await api('/cart', { method: 'DELETE', token: t });
    const r = await api('/cart', { method: 'POST', token: t, body: { productId: product.id, quantity: 1 } });
    if (r.status !== 201) throw new Error(`Thêm giỏ thất bại: ${JSON.stringify(r.data)}`);
  }));

  const t0 = Date.now();
  const results = await Promise.all(tokens.map((t) => api('/orders', {
    method: 'POST', token: t,
    body: { shipping_name: 'Khách Test', shipping_phone: '0901234567', shipping_address: '254 Nguyễn Văn Linh, Đà Nẵng' },
  })));
  const ms = Date.now() - t0;

  const ok = results.filter((r) => r.status === 201).length;
  const conflict = results.filter((r) => r.status === 409).length;
  const other = results.filter((r) => ![201, 409].includes(r.status));
  const after = await findProduct(staff);

  console.log(`Thành công (201): ${ok} | Hết hàng (409): ${conflict} | Khác: ${other.length} | ${ms}ms`);
  console.log(`Tồn kho sau test: ${after.stock}`);
  const expected = Math.min(N, STOCK);
  const pass = ok === expected && after.stock === STOCK - expected && other.length === 0;
  console.log(pass ? '\n✅ PASS: không over-selling, tồn kho không âm' : '\n❌ FAIL: có dấu hiệu race condition');
  if (other.length) console.log('Phản hồi bất thường (mẫu):', JSON.stringify(other[0]));
  process.exit(pass ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
