/**
 * Cliente HTTP de integracion con Finnhub REST API.
 *
 * Responsabilidades:
 *   - Realizar peticiones GET a los endpoints de Finnhub usando httpClient.js
 *     para obtener retry, timeout y manejo de errores automatico.
 *   - getCompanyNews(symbol, daysBack)  → noticias de empresa en rango de fechas.
 *   - getMarketNews(category, limit)  → noticias generales por categoria.
 *
 * Restricciones:
 *   - Free tier: maximo 60 llamadas/minuto.
 *   - Solo se invoca durante la generacion de senales (cada 5 min).
 *   - Si FINNHUB_API_KEY no esta configurada, devuelve array vacio.
 *
 * Consumido por:
 *   - finnhub.service.js → fetchFinancialNews(), pipeline de IA.
 */

import { httpGet } from '../utils/httpClient.js';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

const FINNHUB_API_URL = 'https://finnhub.io/api/v1';
const API_KEY = config.FINNHUB_API_KEY ?? '';

// Rate limiter interno: maximo 60 llamadas por minuto a Finnhub
const MAX_CALLS_PER_MINUTE = 60;
let callTimestamps = [];

function canMakeCall() {
  const now = Date.now();
  const oneMinuteAgo = now - 60_000;
  callTimestamps = callTimestamps.filter((ts) => ts > oneMinuteAgo);
  return callTimestamps.length < MAX_CALLS_PER_MINUTE;
}

function recordCall() {
  callTimestamps.push(Date.now());
}

function ensureApiKey() {
  return !!API_KEY;
}

/**
 * Normaliza un item de noticia de Finnhub a formato estandar interno.
 *
 * @param {Object} item
 * @returns {Object}
 */
function normalizeItem(item) {
  return {
    id: item.id || item.url || null,
    headline: item.headline || item.title || '',
    summary: item.summary || '',
    url: item.url || null,
    source: item.source || null,
    related: item.related || null,
    datetime: item.datetime ? new Date(item.datetime * 1000) : null,
  };
}

/**
 * Obtiene noticias de una empresa especifica en un rango de fechas.
 *
 * @param {string} symbol - Simbolo bursatil (ej: AAPL, TSLA).
 * @param {number} [daysBack=7] - Dias hacia atras.
 * @returns {Promise<Object[]>} Noticias normalizadas (array vacio si no hay API key o se excede rate limit).
 */
export async function getCompanyNews(symbol, daysBack = 7) {
  if (!ensureApiKey()) {
    logger.debug('Finnhub API key not configured, returning empty array');
    return [];
  }
  if (!canMakeCall()) {
    logger.warn('Finnhub rate limit exceeded (60 calls/min), returning empty array');
    return [];
  }

  const to = new Date();
  const from = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
  const fromStr = from.toISOString().slice(0, 10);
  const toStr = to.toISOString().slice(0, 10);

  const url = `${FINNHUB_API_URL}/company-news?symbol=${encodeURIComponent(symbol)}&from=${fromStr}&to=${toStr}&token=${API_KEY}`;

  try {
    recordCall();
    const data = await httpGet(url, { timeout: 10_000, retries: 1 });
    if (!Array.isArray(data)) return [];
    return data.map(normalizeItem);
  } catch (err) {
    logger.warn({ err: err.message, symbol }, 'Finnhub getCompanyNews failed');
    return [];
  }
}

/**
 * Obtiene noticias del mercado por categoria.
 *
 * @param {string} [category='general'] - Categoria: general, forex, crypto, merger.
 * @param {number} [limit=50] - Maximo de noticias.
 * @returns {Promise<Object[]>} Noticias normalizadas (array vacio si no hay API key o se excede rate limit).
 */
export async function getMarketNews(category = 'general', limit = 50) {
  if (!ensureApiKey()) {
    logger.debug('Finnhub API key not configured, returning empty array');
    return [];
  }
  if (!canMakeCall()) {
    logger.warn('Finnhub rate limit exceeded (60 calls/min), returning empty array');
    return [];
  }

  const url = `${FINNHUB_API_URL}/news?category=${encodeURIComponent(category)}&token=${API_KEY}`;

  try {
    recordCall();
    const data = await httpGet(url, { timeout: 10_000, retries: 1 });
    if (!Array.isArray(data)) return [];
    return data.slice(0, limit).map(normalizeItem);
  } catch (err) {
    logger.warn({ err: err.message, category }, 'Finnhub getMarketNews failed');
    return [];
  }
}
