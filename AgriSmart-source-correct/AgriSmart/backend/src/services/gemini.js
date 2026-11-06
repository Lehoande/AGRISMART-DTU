const AppError = require('../lib/AppError');

const configuredModel = () => process.env.GEMINI_MODEL || 'gemini-3.8-flash';

async function generateText({ prompt, systemInstruction, maxOutputTokens = 500 }) {
  const apiKey = String(process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) throw new AppError(503, 'Chưa cấu hình Gemini API key.');

  let payload = {};
  let response;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          model: configuredModel(),
          input: prompt,
          system_instruction: systemInstruction,
          generation_config: { max_output_tokens: maxOutputTokens },
        }),
        signal: AbortSignal.timeout(18000),
      });
    } catch {
      throw new AppError(503, 'Không kết nối được Gemini. Vui lòng thử lại sau.');
    }
    payload = await response.json().catch(() => ({}));
    if (response.ok) break;
    if (![429, 503].includes(response.status) || attempt === 1) {
      const message = String(payload.error?.message || 'Gemini trả về lỗi.').slice(0, 300);
      throw new AppError(response.status === 429 || response.status === 503 ? 503 : 502, `Gemini: ${message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 600));
  }
  const text = (payload.steps || [])
    .filter((step) => step.type === 'model_output')
    .flatMap((step) => step.content || [])
    .filter((part) => part.type === 'text' && typeof part.text === 'string')
    .map((part) => part.text)
    .join('\n').trim();
  if (!text) throw new AppError(502, 'Gemini không trả về nội dung văn bản.');
  return { text, model: configuredModel() };
}

module.exports = { generateText, configuredModel };
