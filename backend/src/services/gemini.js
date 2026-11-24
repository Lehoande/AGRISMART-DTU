const AppError = require('../lib/AppError');

const configuredModel = () => {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_MODEL || 'gpt-4o-mini';
  return process.env.GEMINI_MODEL || 'gemini-3.8-flash';
};

async function generateWithOpenAI({ prompt, systemInstruction, maxOutputTokens = 500 }) {
  const apiKey = String(process.env.OPENAI_API_KEY || '').trim();
  if (!apiKey) throw new AppError(503, 'Chưa cấu hình OpenAI API key.');

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const messages = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  let response;
  try {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxOutputTokens,
      }),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new AppError(503, 'Không kết nối được dịch vụ OpenAI. Vui lòng thử lại sau.');
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = payload.error?.message || `OpenAI trả về mã lỗi ${response.status}`;
    throw new AppError(response.status === 429 ? 429 : 502, `OpenAI: ${errorMsg}`);
  }

  const text = payload.choices?.[0]?.message?.content?.trim();
  if (!text) throw new AppError(502, 'OpenAI không trả về nội dung.');
  return { text, model, provider: 'openai' };
}

async function generateWithGemini({ prompt, systemInstruction, maxOutputTokens = 500 }) {
  const apiKey = String(process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) throw new AppError(503, 'Chưa cấu hình Gemini API key.');

  const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  let payload = {};
  let response;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          model: geminiModel,
          input: prompt,
          system_instruction: systemInstruction,
          generation_config: { max_output_tokens: maxOutputTokens },
        }),
        signal: AbortSignal.timeout(25000),
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
  let text = (payload.steps || [])
    .filter((step) => step.type === 'model_output')
    .flatMap((step) => step.content || [])
    .filter((part) => part.type === 'text' && typeof part.text === 'string')
    .map((part) => part.text)
    .join('\n').trim();
  if (!text) throw new AppError(502, 'Gemini không trả về nội dung văn bản.');

  // Clean any model leakage of directives / thinking / meta tags
  text = text
    .replace(/^(\*+\s*)?directives\b[^\n]*\n([\s\S]*?\n\n)?/i, '')
    .replace(/^(\*+\s*)?persona\b[^\n]*\n/i, '')
    .trim();
  if (!text) text = (payload.steps || []).filter((s) => s.type === 'model_output').flatMap((s) => s.content || []).map((p) => p.text).join('\n').trim();

  return { text, model: geminiModel, provider: 'gemini' };
}

async function generateText({ prompt, systemInstruction, maxOutputTokens = 500 }) {
  if (process.env.OPENAI_API_KEY) {
    try {
      return await generateWithOpenAI({ prompt, systemInstruction, maxOutputTokens });
    } catch (openAiError) {
      console.warn('[AI:Provider] OpenAI ChatGPT error:', openAiError.message);
      if (process.env.GEMINI_API_KEY) {
        console.warn('[AI:Provider] Fallback sang Gemini...');
        return await generateWithGemini({ prompt, systemInstruction, maxOutputTokens });
      }
      throw openAiError;
    }
  }

  return await generateWithGemini({ prompt, systemInstruction, maxOutputTokens });
}

module.exports = { generateText, configuredModel, generateWithOpenAI, generateWithGemini };
