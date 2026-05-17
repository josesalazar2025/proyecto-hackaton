/**
 * Cliente CoinGecko para spot prices de cripto.
 *
 * Sin API key (free tier publico). Rate limit ~30 req/min — usamos cache TTL 60s
 * para evitar excederlo cuando hay muchos mercados de cripto en un ciclo.
 *
 * Consumido por:
 *   - signals/aiPipeline.js → enriquece el prompt con ground truth para
 *     mercados de precio objetivo (BTC $150k, ETH $5k, etc).
 */

import { httpGet } from './httpClient.js';
import { logger } from './logger.js';

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price';
const CACHE_TTL_MS = 60_000;

// Mapeo symbol → id de CoinGecko
const COIN_IDS = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  DOGE: 'dogecoin',
  XRP: 'ripple',
  ADA: 'cardano',
  AVAX: 'avalanche-2',
  LINK: 'chainlink',
  MATIC: 'matic-network',
  DOT: 'polkadot',
};

let cache = { data: null, timestamp: 0 };

async function refreshCache() {
  const ids = Object.values(COIN_IDS).join(',');
  const url = `${COINGECKO_URL}?ids=${ids}&vs_currencies=usd`;
  try {
    const data = await httpGet(url, { timeout: 8000, retries: 1 });
    // Normaliza: { bitcoin: { usd: 103400 }, ... } → { BTC: 103400, ... }
    const normalized = {};
    for (const [symbol, id] of Object.entries(COIN_IDS)) {
      if (data[id]?.usd != null) normalized[symbol] = data[id].usd;
    }
    cache = { data: normalized, timestamp: Date.now() };
    return normalized;
  } catch (err) {
    logger.warn({ err: err.message }, 'CoinGecko fetch failed');
    return cache.data || {};
  }
}

/**
 * Devuelve { BTC: 103400, ETH: 3450, SOL: 142, ... } en USD.
 * Cache TTL 60s.
 */
export async function getSpotPrices() {
  if (cache.data && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    return cache.data;
  }
  return refreshCache();
}

/**
 * Detecta si una pregunta de mercado es de "precio objetivo cripto".
 * Devuelve { symbol, targetPrice, currentPrice, requiredMovePct, deadline } o null.
 */
export async function analyzeCryptoTarget(question) {
  if (!question) return null;

  // Detecta symbol (BTC|Bitcoin|ETH|Ethereum|SOL|Solana)
  const symbolMap = [
    { rx: /\b(bitcoin|btc)\b/i, sym: 'BTC' },
    { rx: /\b(ethereum|eth)\b/i, sym: 'ETH' },
    { rx: /\b(solana|sol)\b/i, sym: 'SOL' },
    { rx: /\b(dogecoin|doge)\b/i, sym: 'DOGE' },
    { rx: /\b(xrp|ripple)\b/i, sym: 'XRP' },
    { rx: /\b(cardano|ada)\b/i, sym: 'ADA' },
  ];
  const match = symbolMap.find(({ rx }) => rx.test(question));
  if (!match) return null;

  // Detecta target price ($150k, $3,500, $100,000)
  const priceMatch = question.match(/\$\s?([\d,]+(?:\.\d+)?)\s?([kKmM])?/);
  if (!priceMatch) return null;
  let target = parseFloat(priceMatch[1].replace(/,/g, ''));
  if (priceMatch[2]?.toLowerCase() === 'k') target *= 1000;
  if (priceMatch[2]?.toLowerCase() === 'm') target *= 1_000_000;

  const spots = await getSpotPrices();
  const current = spots[match.sym];
  if (!current || !target) return null;

  const requiredMovePct = ((target - current) / current) * 100;
  return {
    symbol: match.sym,
    currentPrice: current,
    targetPrice: target,
    requiredMovePct,
  };
}
