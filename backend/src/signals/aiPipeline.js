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
import { fetchFinancialNewsForMarket, filterNewsByRelevance } from '../finnhub/finnhub.service.js';
import { analyzeCryptoTarget } from '../utils/coingecko.client.js';

const HF_API = 'https://api-inference.huggingface.co/models';
const FINBERT_MODEL = 'ProsusAI/finbert';
const QWEN_MODEL = 'Qwen/Qwen3-8B';
const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'deepseek/deepseek-chat';

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

function buildPrompt(market, headlines, cryptoContext = null) {
  const newsSection = headlines.length
    ? `Recent news (use these to detect mispricing):\n${headlines.map((h) => `- ${h.headline}`).join('\n')}`
    : 'No news available. Reason from base rates, the current implied probability, and the time-to-resolution.';

  const yes = market.yesPrice;
  const priceContext = yes != null
    ? `Implied YES probability: ${(yes * 100).toFixed(1)}%. The market is pricing this outcome at ${yes >= 0.7 ? 'HIGH confidence YES' : yes <= 0.3 ? 'HIGH confidence NO' : 'a contested midrange'}.`
    : 'No price available.';

  // Ground truth de cripto cuando aplica
  const cryptoSection = cryptoContext
    ? [
        ``,
        `GROUND TRUTH (verified spot data):`,
        `${cryptoContext.symbol} current spot price: $${cryptoContext.currentPrice.toLocaleString()}`,
        `Target in question: $${cryptoContext.targetPrice.toLocaleString()}`,
        `Required move from spot: ${cryptoContext.requiredMovePct >= 0 ? '+' : ''}${cryptoContext.requiredMovePct.toFixed(1)}%`,
        `Use this to judge whether the implied probability is plausible given typical volatility.`,
      ].join('\n')
    : '';

  // Tiempo hasta resolucion
  const daysToClose = market.closesAt
    ? Math.max(0, Math.ceil((new Date(market.closesAt) - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;
  const timeSection = daysToClose != null
    ? `Days until resolution: ${daysToClose}.`
    : '';

  return [
    `You are a sharp prediction-market trader looking for EDGE — situations where the market price diverges from the fair probability given recent information.`,
    ``,
    `Market: "${market.question}"`,
    `Category: ${market.category ?? 'general'}`,
    `YES price: ${yes ?? 'N/A'} | NO price: ${market.noPrice ?? 'N/A'}`,
    priceContext,
    timeSection,
    cryptoSection,
    ``,
    newsSection,
    ``,
    `Your job is NOT to repeat what the market price says. Your job is to identify if the market is MISPRICED:`,
    `- "bullish" = you think YES is undervalued (true probability > implied price). Higher confidence when news supports YES but price hasn't moved yet.`,
    `- "bearish" = you think NO is undervalued (true probability < implied price). Higher confidence when news supports NO but price hasn't reacted.`,
    `- "neutral" = market price looks fair given available information; no edge.`,
    ``,
    `Confidence calibration: 0.5-0.6 = weak lean, 0.6-0.75 = clear edge, 0.75-0.9 = strong conviction with concrete catalyst.`,
    `Summary must mention WHY (specific news item or price-vs-fundamentals gap). Avoid generic statements.`,
    ``,
    `Return ONLY this JSON, no markdown, no explanation:`,
    `{"signal":"bullish"|"bearish"|"neutral","confidence":<0.0-1.0>,"summary":"<2 sentences explaining the EDGE>","keyRisk":"<1 sentence: what would invalidate this thesis>"}`,
  ].join('\n');
}

// ── Gradio Spaces clients ────────────────────────────────────────────────────

async function getModernFinBERTClient() {
  if (!modernFinBERTClient && config.HF_SPACE_MODERNFINBERT_URL) {
    modernFinBERTClient = await Client.connect(config.HF_SPACE_MODERNFINBERT_URL, {
      token: config.HF_TOKEN,
    });
  }
  return modernFinBERTClient;
}

async function getQwenClient() {
  if (!qwenClient && config.HF_SPACE_QWEN_URL) {
    qwenClient = await Client.connect(config.HF_SPACE_QWEN_URL, {
      token: config.HF_TOKEN,
    });
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

async function generateWithQwenSpace(market, headlines, cryptoContext = null) {
  const client = await getQwenClient();
  if (!client) return null;

  const newsSummary = headlines.length
    ? headlines.map((h) => `- ${h.headline}`).join('\n')
    : 'No relevant news available.';

  const cryptoLine = cryptoContext
    ? `\nGround truth: ${cryptoContext.symbol} spot $${cryptoContext.currentPrice.toLocaleString()}, target $${cryptoContext.targetPrice.toLocaleString()} (${cryptoContext.requiredMovePct >= 0 ? '+' : ''}${cryptoContext.requiredMovePct.toFixed(1)}% required).`
    : '';

  const marketContext = [
    `Market: "${market.question}"`,
    `YES price: ${market.yesPrice ?? 'N/A'} | NO price: ${market.noPrice ?? 'N/A'}${cryptoLine}`,
  ].join('\n');

  const result = await client.predict('/predict', {
    market_context: marketContext,
    news_summary: newsSummary,
  });

  // result.data[0] → { signal, confidence, summary, keyRisk }
  const data = result.data[0];
  if (data) data.modelVersion = 'HF Space Qwen3-8B';
  return data;
}

async function callChatCompletion(url, model, messages, authHeader) {
  const data = await httpPost(
    url,
    { model, messages, max_tokens: 300, temperature: 0.3 },
    { headers: { Authorization: authHeader }, retries: 1, timeout: 30_000 },
  );
  return data?.choices?.[0]?.message?.content ?? null;
}

async function generateWithQwen3Direct(market, headlines, cryptoContext = null) {
  const content = await callChatCompletion(
    `${HF_API}/${QWEN_MODEL}/v1/chat/completions`,
    QWEN_MODEL,
    [{ role: 'user', content: buildPrompt(market, headlines, cryptoContext) }],
    `Bearer ${config.HF_TOKEN}`,
  );
  const data = content ? extractJson(content) : null;
  if (data) data.modelVersion = 'HF API Qwen3-8B';
  return data;
}

async function generateWithOpenRouter(market, headlines, cryptoContext = null) {
  const content = await callChatCompletion(
    OPENROUTER_API,
    OPENROUTER_MODEL,
    [{ role: 'user', content: buildPrompt(market, headlines, cryptoContext) }],
    `Bearer ${config.OPENROUTER_API_KEY}`,
  );
  const data = content ? extractJson(content) : null;
  if (data) data.modelVersion = 'OpenRouter DeepSeek-V3';
  return data;
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
      modelVersion: 'Rule-based (price-only)',
    };
  if (p <= 0.35)
    return {
      signal: 'bearish',
      confidence: Math.min(1 - p, 0.9),
      summary: `Market strongly favors NO at ${((1 - p) * 100).toFixed(0)}% probability. Downside momentum dominates.`,
      keyRisk: 'Unexpected positive developments could reverse this rapidly.',
      modelVersion: 'Rule-based (price-only)',
    };
  return {
    signal: 'neutral',
    confidence: 0.5,
    summary: 'Market is closely contested with no clear directional signal. Both outcomes remain plausible.',
    keyRisk: 'High uncertainty in both directions; position sizing should be conservative.',
    modelVersion: 'Rule-based (price-only)',
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

/**
 * Mapea (signal, confidence) → probabilidad "justa" YES segun la IA.
 *   bullish + conf 0.8 → 0.5 + 0.8 * 0.5 = 0.9 (YES muy probable)
 *   bearish + conf 0.8 → 0.5 - 0.8 * 0.5 = 0.1 (YES improbable)
 *   neutral             → 0.5
 */
function signalToFairProbability(signal, confidence) {
  const c = Math.max(0, Math.min(1, confidence ?? 0.5));
  if (signal === 'bullish') return 0.5 + c * 0.5;
  if (signal === 'bearish') return 0.5 - c * 0.5;
  return 0.5;
}

export async function run(market) {
  // Paso 1: obtiene noticias financieras RELEVANTES para este mercado especifico
  let headlines = [];
  try {
    const marketNews = await fetchFinancialNewsForMarket(market);
    const relevant = filterNewsByRelevance(marketNews, market.question);
    if (relevant.length) {
      headlines = await filterWithFinBERT(relevant);
    } else {
      headlines = [];
    }
  } catch (err) {
    logger.warn({ err: err.message, marketId: market.id }, 'news fetch failed, continuing without news');
  }

  // Paso 1b: ground truth de cripto si aplica (BTC/ETH/SOL spot vs target)
  let cryptoContext = null;
  try {
    cryptoContext = await analyzeCryptoTarget(market.question);
    if (cryptoContext) {
      logger.debug({ marketId: market.id, ...cryptoContext }, 'crypto ground truth injected');
    }
  } catch (err) {
    logger.warn({ err: err.message }, 'crypto context fetch failed');
  }

  // Paso 2: generacion de senal LLM con cadena de respaldo
  let result = null;

  // Intenta Space primero
  if (config.HF_SPACE_QWEN_URL) {
    try {
      result = await generateWithQwenSpace(market, headlines, cryptoContext);
      result = normalizeSignal(result);
      if (!validateSignal(result)) result = null;
    } catch (err) {
      logger.warn({ err: err.message, marketId: market.id }, 'Qwen Space failed, trying direct API');
    }
  }

  // Respaldo a API directa de HF
  if (!result && config.HF_TOKEN) {
    try {
      result = await generateWithQwen3Direct(market, headlines, cryptoContext);
      if (!validateSignal(result)) result = null;
    } catch (err) {
      logger.warn({ err: err.message, marketId: market.id }, 'Qwen3 direct API failed, trying OpenRouter');
    }
  }

  // Respaldo a OpenRouter
  if (!result && config.OPENROUTER_API_KEY) {
    try {
      result = await generateWithOpenRouter(market, headlines, cryptoContext);
      if (!validateSignal(result)) result = null;
    } catch (err) {
      logger.warn({ err: err.message, status: err.status, marketId: market.id }, 'OpenRouter failed, using rule-based');
    }
  }

  // Respaldo final
  if (!result) {
    result = ruleBasedSignal(market);
  }

  // Calcula edge: (fairProb - impliedProb)
  const impliedProb = market.yesPrice ?? null;
  const fairProb = signalToFairProbability(result.signal, result.confidence);
  const edgePoints = impliedProb != null ? (fairProb - impliedProb) * 100 : null;

  return {
    ...result,
    newsCount: headlines.length,
    impliedProb,
    fairProb,
    edgePoints,
  };
}
