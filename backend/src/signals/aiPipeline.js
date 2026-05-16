import { httpPost } from '../utils/httpClient.js';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import { fetchFinancialNews, filterNewsByRelevance } from './finnhub.client.js';

const HF_API = 'https://api-inference.huggingface.co/models';
const FINBERT_MODEL = 'ProsusAI/finbert';
const QWEN_MODEL = 'Qwen/Qwen3-8B';
const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'deepseek/deepseek-chat-v3-0324:free';

// ── helpers ──────────────────────────────────────────────────────────────────

function hfHeaders() {
  return { Authorization: `Bearer ${config.HF_TOKEN}` };
}

function extractJson(text) {
  try { return JSON.parse(text); } catch {}
  // strip <think>...</think> blocks (Qwen3 thinking mode)
  const stripped = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  try { return JSON.parse(stripped); } catch {}
  const block = stripped.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (block) { try { return JSON.parse(block[1].trim()); } catch {} }
  const inline = stripped.match(/\{[\s\S]*?\}/);
  if (inline) { try { return JSON.parse(inline[0]); } catch {} }
  return null;
}

function buildPrompt(market, headlines) {
  const newsSection = headlines.length
    ? `Relevant news:\n${headlines.map((h) => `- ${h.headline}`).join('\n')}`
    : 'No relevant news available.';
  return [
    `You are a prediction market analyst. Analyze the following market and respond ONLY with valid JSON.`,
    ``,
    `Market: "${market.question}"`,
    `YES price: ${market.yesPrice ?? 'N/A'} | NO price: ${market.noPrice ?? 'N/A'}`,
    newsSection,
    ``,
    `Return ONLY this JSON structure, no markdown, no explanation:`,
    `{"signal":"bullish"|"bearish"|"neutral","confidence":<0.0-1.0>,"summary":"<2 sentences>","keyRisk":"<1 sentence>"}`,
  ].join('\n');
}

// ── FinBERT filtering ─────────────────────────────────────────────────────────

async function filterWithFinBERT(articles) {
  if (!articles.length) return articles;
  const inputs = articles.map((a) => a.headline);
  const results = await httpPost(
    `${HF_API}/${FINBERT_MODEL}`,
    { inputs },
    { headers: hfHeaders(), retries: 1 },
  );
  // keep headlines classified as positive or negative with score >= 0.65
  return articles.filter((_, i) => {
    const top = results[i]?.[0];
    return top && top.label !== 'neutral' && top.score >= 0.65;
  });
}

// ── LLM generation ────────────────────────────────────────────────────────────

async function callChatCompletion(url, model, messages, authHeader) {
  const data = await httpPost(
    url,
    { model, messages, max_tokens: 300, temperature: 0.3 },
    { headers: { Authorization: authHeader }, retries: 1, timeout: 30_000 },
  );
  return data?.choices?.[0]?.message?.content ?? null;
}

async function generateWithQwen3(market, headlines) {
  const content = await callChatCompletion(
    `${HF_API}/${QWEN_MODEL}/v1/chat/completions`,
    QWEN_MODEL,
    [{ role: 'user', content: buildPrompt(market, headlines) }],
    `Bearer ${config.HF_TOKEN}`,
  );
  return content ? extractJson(content) : null;
}

async function generateWithOpenRouter(market, headlines) {
  const content = await callChatCompletion(
    OPENROUTER_API,
    OPENROUTER_MODEL,
    [{ role: 'user', content: buildPrompt(market, headlines) }],
    `Bearer ${config.OPENROUTER_API_KEY}`,
  );
  return content ? extractJson(content) : null;
}

// ── rule-based fallback ───────────────────────────────────────────────────────

function ruleBasedSignal(market) {
  const p = market.yesPrice ?? 0.5;
  if (p >= 0.65)
    return {
      signal: 'bullish',
      confidence: Math.min(p, 0.9),
      summary: `Market strongly favors YES at ${(p * 100).toFixed(0)}% probability. Momentum is positive.`,
      keyRisk: 'Sentiment shift could rapidly reprice the market.',
    };
  if (p <= 0.35)
    return {
      signal: 'bearish',
      confidence: Math.min(1 - p, 0.9),
      summary: `Market strongly favors NO at ${((1 - p) * 100).toFixed(0)}% probability. Downside momentum dominates.`,
      keyRisk: 'Unexpected positive developments could reverse this rapidly.',
    };
  return {
    signal: 'neutral',
    confidence: 0.5,
    summary: 'Market is closely contested with no clear directional signal. Both outcomes remain plausible.',
    keyRisk: 'High uncertainty in both directions; position sizing should be conservative.',
  };
}

function validateSignal(result) {
  if (!result) return false;
  const validSignals = ['bullish', 'bearish', 'neutral'];
  return (
    validSignals.includes(result.signal) &&
    typeof result.confidence === 'number' &&
    result.confidence >= 0 &&
    result.confidence <= 1 &&
    typeof result.summary === 'string' &&
    typeof result.keyRisk === 'string'
  );
}

// ── public API ────────────────────────────────────────────────────────────────

export async function run(market) {
  // Step 1: fetch and filter news
  let headlines = [];
  try {
    const allNews = await fetchFinancialNews(30);
    const relevant = filterNewsByRelevance(allNews, market.question);
    if (config.HF_TOKEN && relevant.length) {
      headlines = await filterWithFinBERT(relevant);
    } else {
      headlines = relevant.slice(0, 10);
    }
  } catch (err) {
    logger.warn({ err: err.message, marketId: market.id }, 'news fetch failed, continuing without news');
  }

  // Step 2: LLM signal generation with fallback chain
  let result = null;

  if (config.HF_TOKEN) {
    try {
      result = await generateWithQwen3(market, headlines);
      if (!validateSignal(result)) result = null;
    } catch (err) {
      logger.warn({ err: err.message, marketId: market.id }, 'Qwen3 failed, trying OpenRouter');
    }
  }

  if (!result && config.OPENROUTER_API_KEY) {
    try {
      result = await generateWithOpenRouter(market, headlines);
      if (!validateSignal(result)) result = null;
    } catch (err) {
      logger.warn({ err: err.message, marketId: market.id }, 'OpenRouter failed, using rule-based');
    }
  }

  if (!result) {
    result = ruleBasedSignal(market);
  }

  return { ...result, newsCount: headlines.length };
}
