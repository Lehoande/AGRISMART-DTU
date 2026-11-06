const router = require('express').Router();
const { auth, allowRoles } = require('../middleware');
const pool = require('../db');
const AppError = require('../lib/AppError');
const asyncHandler = require('../lib/asyncHandler');
const { generateText, configuredModel } = require('../services/gemini');

const aiUrl = () => String(process.env.AI_SERVICE_URL || 'http://localhost:8001').replace(/\/$/, '');

router.post('/buyer-answer', auth(false), asyncHandler(async (req, res) => {
  const question = String(req.body.question || '').trim().slice(0, 1000);
  const ids = Array.isArray(req.body.productIds) ? [...new Set(req.body.productIds.map(Number).filter((id) => Number.isInteger(id) && id > 0))].slice(0, 5) : [];
  if (!question) throw new AppError(400, 'Nhập câu hỏi về sản phẩm.');
  const products = [];
  if (ids.length) {
    const [rows] = await pool.query(`SELECT p.id,p.name,p.description,p.price,p.unit,p.origin,p.region,p.harvest_date,p.certification,p.traceability_code,p.storage_condition,p.stock
      FROM products p WHERE p.id IN (${ids.map(() => '?').join(',')}) AND p.is_active=1
      AND (p.seller_id IS NULL OR EXISTS (SELECT 1 FROM seller_profiles sp WHERE sp.user_id=p.seller_id AND sp.status='approved'))`, ids);
    products.push(...rows);
  }
  if (!products.length) throw new AppError(400, 'Hãy chọn ít nhất một sản phẩm đang mở bán.');
  const systemInstruction = 'Bạn là trợ lý mua nông sản AgriSmart. Chỉ trả lời dựa trên JSON dữ kiện sản phẩm; tuyệt đối không suy diễn hoặc bịa nguồn gốc, mùa vụ, chất lượng, lợi ích sức khỏe, chứng nhận hay quy trình. Nếu trường bị thiếu, nói rõ người bán chưa cung cấp. Chứng nhận và truy xuất là thông tin người bán khai báo, chưa được hệ thống xác minh độc lập. Trả lời tiếng Việt ngắn gọn, nêu tên sản phẩm liên quan.';
  const result = await generateText({ systemInstruction, prompt: `Câu hỏi người mua: ${question}\nDữ kiện sản phẩm đang mở bán (nguồn dữ liệu hệ thống): ${JSON.stringify(products)}`, maxOutputTokens: 500 });
  res.json({ text: result.text, model: result.model, disclaimer: 'Câu trả lời dựa trên dữ liệu người bán khai báo; chưa phải xác minh độc lập.' });
}));

router.get('/health', asyncHandler(async (_req, res) => {
  const geminiConfigured = Boolean(String(process.env.GEMINI_API_KEY || '').trim());
  try {
    const response = await fetch(`${aiUrl()}/health`, { signal: AbortSignal.timeout(2500) });
    if (!response.ok) return res.json({ available: false, engine: null, geminiConfigured, geminiModel: geminiConfigured ? configuredModel() : null });
    const service = await response.json();
    return res.json({ available: true, engine: service.engine || 'unknown', geminiConfigured, geminiModel: geminiConfigured ? configuredModel() : null });
  } catch {
    return res.json({ available: false, engine: null, geminiConfigured, geminiModel: geminiConfigured ? configuredModel() : null });
  }
}));

router.post('/generate-draft', auth(), allowRoles('seller'), asyncHandler(async (req, res) => {
  const task = String(req.body.task || '');
  if (!['product-description', 'buyer-reply'].includes(task)) throw new AppError(400, 'Loại bản nháp không hợp lệ.');
  const raw = req.body.product && typeof req.body.product === 'object' ? req.body.product : {};
  const product = Object.fromEntries(['name', 'description', 'unit', 'origin', 'region', 'harvest_date', 'certification', 'storage_condition', 'traceability_code', 'stock']
    .map((key) => [key, String(raw[key] ?? '').trim().slice(0, key === 'description' ? 2000 : 300)]));
  if (!product.name) throw new AppError(400, 'Thiếu tên sản phẩm.');
  const question = String(req.body.question || '').trim().slice(0, 1000);
  const systemInstruction = 'Bạn là trợ lý soạn nháp cho gian hàng nông sản tại Việt Nam. Chỉ dùng dữ kiện trong JSON được cung cấp. Không bịa nguồn gốc, chứng nhận, chất lượng, lợi ích sức khỏe, giá hoặc thời gian giao hàng. Chứng nhận là thông tin người bán khai báo, không được viết như đã được xác minh. Nếu thiếu dữ kiện, nói rõ cần người bán xác nhận. Trả lời bằng tiếng Việt tự nhiên, ngắn gọn.';
  const prompt = task === 'product-description'
    ? `Viết mô tả sản phẩm ngắn, dễ đọc cho trang bán hàng. Không đưa nội dung chưa có trong dữ kiện. Dữ kiện: ${JSON.stringify(product)}`
    : `Soạn bản nháp trả lời câu hỏi người mua, xưng là gian hàng. Nếu không đủ dữ kiện để trả lời chính xác, lịch sự nói người bán cần kiểm tra lại.\nCâu hỏi: ${question || '(không có câu hỏi cụ thể)'}\nDữ kiện sản phẩm: ${JSON.stringify(product)}`;
  const result = await generateText({ prompt, systemInstruction, maxOutputTokens: task === 'product-description' ? 350 : 450 });
  res.json({ ...result, provider: 'gemini' });
}));

router.post('/analyze-product', auth(), allowRoles('seller'), asyncHandler(async (req, res) => {
  const apiKey = String(process.env.GEMINI_API_KEY || '').trim();
  if (apiKey) {
    const input = Object.fromEntries(['name', 'category', 'description', 'origin', 'certification', 'harvest_date', 'stock', 'storage_condition']
      .map((key) => [key, String(req.body[key] ?? '').trim().slice(0, key === 'description' ? 2000 : 300)]));
    try {
      const result = await generateText({
        systemInstruction: 'Bạn rà soát dữ liệu sản phẩm nông nghiệp. Không xác minh được nguồn gốc, chứng nhận, chất lượng hay ảnh. Không tự khẳng định đã kiểm định. Phân loại chỉ là gợi ý. Trả về đúng một đối tượng JSON, không markdown, khóa suggested_category là một trong Trái cây, Rau củ, Gạo & ngũ cốc, Nông sản khác; warnings là mảng chuỗi tiếng Việt; category_matches_input là boolean; ready_for_review là boolean.',
        prompt: `Phân loại và kiểm tra dữ kiện sản phẩm sau. Nêu các trường còn thiếu hoặc không hợp lý, không kết luận chất lượng. Dữ kiện: ${JSON.stringify(input)}`,
        maxOutputTokens: 450,
      });
      const jsonText = result.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      const analysis = JSON.parse(jsonText);
      const categories = ['Trái cây', 'Rau củ', 'Gạo & ngũ cốc', 'Nông sản khác'];
      if (!categories.includes(analysis.suggested_category) || !Array.isArray(analysis.warnings)) throw new Error('Invalid Gemini response shape');
      return res.json({
        engine: `gemini:${result.model}`,
        suggested_category: analysis.suggested_category,
        category_matches_input: Boolean(analysis.category_matches_input),
        warnings: analysis.warnings.filter((item) => typeof item === 'string').slice(0, 12),
        ready_for_review: Boolean(analysis.ready_for_review),
        disclaimer: 'Đây là gợi ý tự động dựa trên dữ liệu nhập. Hệ thống không xác minh chứng nhận, chất lượng hoặc nguồn gốc.',
      });
    } catch (error) {
      // If the model is unavailable or returns invalid JSON, use the existing deterministic checker.
    }
  }
  let response;
  try {
    response = await fetch(`${aiUrl()}/analyze-product`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body), signal: AbortSignal.timeout(6000),
    });
  } catch {
    throw new AppError(503, 'Dịch vụ trợ lý sản phẩm chưa sẵn sàng. Hãy kiểm tra AI service.');
  }
  if (!response.ok) throw new AppError(502, 'Dịch vụ trợ lý sản phẩm trả về lỗi.');
  res.json(await response.json());
}));

module.exports = router;
