/**
 * Cliente de integracion con Polymarket Gamma API.
 *
 * Responsabilidades:
 *   - fetchActiveMarkets(limit) → obtiene mercados activos desde gamma-api.polymarket.com.
 *   - mapMarket(raw)            → normaliza campos crudos a la estructura del modelo Market:
 *       * id, question, category, countryCode
 *       * yesPrice / noPrice (parseados desde outcomePrices JSON)
 *       * volumeEur / liquidityEur (convertidos de USD a EUR con tasa 0.93)
 *       * status (active | closed | resolved) derivado de flags active/closed/archived
 *       * closesAt, lastSynced
 *
 * No requiere autenticacion. No usa CLOB API (solo datos publicos de mercado).
 * Consumido por scheduler.js cada 30 segundos.
 */

import { httpGet } from '../utils/httpClient.js';

const GAMMA_URL = 'https://gamma-api.polymarket.com/markets';
const USD_TO_EUR = 0.93;

function mapStatus({ active, closed, archived }) {
  if (archived) return 'resolved';
  if (closed) return 'closed';
  return 'active';
}

function parsePrices(outcomePrices) {
  try {
    const arr = JSON.parse(outcomePrices);
    return {
      yesPrice: arr[0] != null ? parseFloat(arr[0]) : null,
      noPrice: arr[1] != null ? parseFloat(arr[1]) : null,
    };
  } catch {
    return { yesPrice: null, noPrice: null };
  }
}

export function mapMarket(raw) {
  const { yesPrice, noPrice } = parsePrices(raw.outcomePrices);
  return {
    id: String(raw.id),
    question: raw.question,
    category: null,
    countryCode: null,
    yesPrice,
    noPrice,
    volumeEur: raw.volume != null ? parseFloat(raw.volume) * USD_TO_EUR : null,
    liquidityEur: raw.liquidity != null ? parseFloat(raw.liquidity) * USD_TO_EUR : null,
    status: mapStatus(raw),
    closesAt: raw.endDate ? new Date(raw.endDate) : null,
    lastSynced: new Date(),
  };
}

export async function fetchActiveMarkets(limit = 100) {
  const url = `${GAMMA_URL}?active=true&closed=false&limit=${limit}`;
  const raw = await httpGet(url);
  return raw.map(mapMarket);
}
