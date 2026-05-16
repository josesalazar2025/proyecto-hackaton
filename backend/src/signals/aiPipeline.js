/**
 * Pipeline de inteligencia artificial para generacion de senales de trading.
 *
 * Flujo de tres fases con fallback:
 *   1. Filtrado de noticias (Finnhub + ModernFinBERT Space o API directa HF).
 *      → descarta noticias neutrales o con score < 0.65.
 *   2. Generacion de senal (Qwen3-8B Space o API directa HF).
 *      → analiza mercado + noticias filtradas y genera:
 *        { signal: 'bullish'|'bearish'|'neutral', confidence, summary, keyRisk }.
 *   3. Fallbacks:
 *      - Si falla el Space de Qwen → intenta API directa de HuggingFace.
 *      - Si falla HF directa      → intenta OpenRouter (deepseek-chat).
 *      - Si todo falla            → regla basada en precio (rule-based).
 *
 * Consumido por:
 *   - signals.service.js → generateForMarket(market).
 *   - scheduler.js       → cada 5 minutos para los 20 mercados activos.
 */

import { Client } from '@gradio/client';
import { httpPost } from '../utils/httpClient.js';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import { fetchFinancialNews, filterNewsByRelevance } from './finnhub.client.js';

const HF_API = 'https://api-inference.huggingface.co/models';
const FINBERT_MODEL = 'ProsusAI/finbert';
const QWEN_MODEL = 'Qwen/Qwen3-8B';
const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'deepseek/deepseek-chat-v3-0324:free';

// Clientes Gradio en cache para Spaces
let modernFinBERTClient = null;
let qwenClient = null;

// ── helpers ──────────────────────────────────────────────────────────────────

function hfHeaders() {
  return { Authorization: `Bearer ${config.HF_TOKEN}` };
}

function extractJson(text) {
  try { return JSON.parse(text); } catch {}
  // elimina bloques <think>...</think> (modo thinking de Qwen3)
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

// ── Gradio Spaces clients ────────────────────────────────────────────────────

async function getModernFinBERTClient() {
  if (!modernFinBERTClient && config.HF_SPACE_MODERNFINBERT_URL) {
    modernFinBERTClient = await Client.connect(config.HF_SPACE_MODERNFINBERT_URL);
  }
  return modernFinBERTClient;
}

async function getQwenClient() {
  if (!qwenClient && config.HF_SPACE_QWEN_URL) {
    qwenClient = await Client.connect(config.HF_SPACE_QWEN_URL);
  }
  return qwenClient;
}

// ── FinBERT filtering via Space or direct API ─────────────────────────────────

async function filterWithFinBERTSpace(articles) {
  if (!articles.length) return articles;
  const client = await getModernFinBERTClient();
  if (!client) return articles;

  const textBlock = articles.map((a) => a.headline).join('\n');
  const result = await client.predict('/predict', { text_block: textBlock });
  // Gradio devuelve: { data: [ [ {label, score}, ... ] ], ... }
  const sentiments = result.data[0];
  return articles.filter((_, i) => {
    const r = sentiments[i];
    if (!r) return false;
    const label = String(r.label).toLowerCase();
    return label !== 'neutral' && (typeof r.score === 'number' ? r.score : parseFloat(r.score)) >= 0.65;
  });
}

async function filterWithFinBERTDirect(articles) {
  if (!articles.length) return articles;
  const inputs = articles.map((a) => a.headline);
  const results = await httpPost(
    `${HF_API}/${FINBERT_MODEL}`,
    { inputs },
    { headers: hfHeaders(), retries: 1 },
  );
  // conserva titulares clasificados como positivos o negativos con score >= 0.65
  return articles.filter((_, i) => {
    const top = results[i]?.[0];
    return top && top.label !== 'neutral' && top.score >= 0.65;
  });
}

async function filterWithFinBERT(articles) {
  // Prefiere Space si esta configurado, respaldo a API directa
  if (config.HF_SPACE_MODERNFINBERT_URL) {
    try {
      return await filterWithFinBERTSpace(articles);
    } catch (err) {
      logger.warn({ err: err.message }, 'ModernFinBERT Space failed, falling back to direct API');
    }
  }
  if (config.HF_TOKEN) {
    return await filterWithFinBERTDirect(articles);
  }
  return articles;
}

// ── LLM generation via Space or direct API ───────────────────────────────────

async function generateWithQwenSpace(market, headlines) {
  const client = await getQwenClient();
  if (!client) return null;

  const newsSummary = headlines.length
    ? headlines.map((h) => `- ${h.headline}`).join('\n')
    : 'No relevant news available.';

  const marketContext = [
    `Market: "${market.question}"`,
    `YES price: ${market.yesPrice ?? 'N/A'} | NO price: ${market.noPrice ?? 'N/A'}`,
  ].join('\n');

  const result = await client.predict('/predict', {
    market_context: marketContext,
    news_summary: newsSummary,
  });

  // result.data[0] → { signal, confidence, summary, keyRisk }
  return result.data[0];
}

async function callChatCompletion(url, model, messages, authHeader) {
  const data = await httpPost(
    url,
    { model, messages, max_tokens: 300, temperature: 0.3 },
    { headers: { Authorization: authHeader }, retries: 1, timeout: 30_000 },
  );
  return data?.choices?.[0]?.message?.content ?? null;
}

async function generateWithQwen3Direct(market, headlines) {
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
  const validSignals = ['bullish', 'bearish', 'neutral', 'buy', 'sell', 'hold'];
  return (
    validSignals.includes(result.signal) &&
    typeof result.confidence === 'number' &&
    result.confidence >= 0 &&
    result.confidence <= 1 &&
    typeof result.summary === 'string' &&
    typeof result.keyRisk === 'string'
  );
}

function normalizeSignal(result) {
  if (!result) return result;
  // Normaliza buy/sell/hold a bullish/bearish/neutral para compatibilidad descendente
  const signalMap = { buy: 'bullish', sell: 'bearish', hold: 'neutral' };
  if (result.signal in signalMap) {
    result.signal = signalMap[result.signal];
  }
  return result;
}

// ── public API ────────────────────────────────────────────────────────────────

export async function run(market) {
  // Paso 1: obtiene y filtra noticias
  let headlines = [];
  try {
    const allNews = await fetchFinancialNews(30);
    const relevant = filterNewsByRelevance(allNews, market.question);
    if (relevant.length) {
      headlines = await filterWithFinBERT(relevant);
    } else {
      headlines = [];
    }
  } catch (err) {
    logger.warn({ err: err.message, marketId: market.id }, 'news fetch failed, continuing without news');
  }

  // Paso 2: generacion de senal LLM con cadena de respaldo
  let result = null;

  // Intenta Space primero
  if (config.HF_SPACE_QWEN_URL) {
    try {
      result = await generateWithQwenSpace(market, headlines);
      result = normalizeSignal(result);
      if (!validateSignal(result)) result = null;
    } catch (err) {
      logger.warn({ err: err.message, marketId: market.id }, 'Qwen Space failed, trying direct API');
    }
  }

  // Respaldo a API directa de HF
  if (!result && config.HF_TOKEN) {
    try {
      result = await generateWithQwen3Direct(market, headlines);
      if (!validateSignal(result)) result = null;
    } catch (err) {
      logger.warn({ err: err.message, marketId: market.id }, 'Qwen3 direct API failed, trying OpenRouter');
    }
  }

  // Respaldo a OpenRouter
  if (!result && config.OPENROUTER_API_KEY) {
    try {
      result = await generateWithOpenRouter(market, headlines);
      if (!validateSignal(result)) result = null;
    } catch (err) {
      logger.warn({ err: err.message, marketId: market.id }, 'OpenRouter failed, using rule-based');
    }
  }

  // Respaldo final
  if (!result) {
    result = ruleBasedSignal(market);
  }

  return { ...result, newsCount: headlines.length };
}
