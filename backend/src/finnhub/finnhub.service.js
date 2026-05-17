/**
 * Logica de negocio del modulo de noticias Finnhub.
 *
 * Responsabilidades:
 *   - fetchFinancialNews(daysBack)      → obtiene noticias generales de mercado.
 *   - filterNewsByRelevance(news, question) → filtra noticias por keywords
 *     extraidos de la pregunta del mercado (matching simple case-insensitive).
 *   - fetchHeadlinesForPipeline({ symbols, daysBack, limitPerSymbol })
 *     → agrega noticias de multiples simbolos para el pipeline de IA.
 *
 * Restricciones:
 *   - Si FINNHUB_API_KEY no esta configurada, devuelve array vacio sin lanzar error
 *     (el pipeline continua con rule-based).
 *   - fetchHeadlinesForPipeline limita a maximo 5 simbolos por llamada
 *     para respetar el rate limit de 60 llamadas/minuto.
 *
 * Consumido por:
 *   - signals/aiPipeline.js → fase 1 de filtrado de noticias.
 */

import { getCompanyNews, getMarketNews } from './finnhub.client.js';
import { logger } from '../utils/logger.js';

const MAX_SYMBOLS_PER_PIPELINE_CALL = 5;

/**
 * Extrae keywords significativas de una pregunta de mercado.
 * Elimina palabras comunes (stop words) y devuelve tokens unicos.
 *
 * @param {string} question
 * @returns {string[]}
 */
function extractKeywords(question) {
  if (!question) return [];
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'between', 'among', 'is', 'are',
    'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
    'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall',
    'can', 'need', 'dare', 'ought', 'used', 'won', 'would', 'it', 'this',
    'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'me',
    'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our',
    'their', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why',
    'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
    'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
    'too', 'very', 'just', 'now', 'then', 'here', 'there', 'once', 'again',
    'further', 'once', 'also', 'back', 'still', 'yet', 'already', 'almost',
    'quite', 'rather', 'really', 'soon', 'today', 'tomorrow', 'yesterday',
    // Espanol
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'o', 'pero',
    'en', 'de', 'a', 'por', 'para', 'con', 'sin', 'sobre', 'entre', 'durante',
    'antes', 'despues', 'durante', 'es', 'son', 'era', 'fue', 'ser', 'estar',
    'ha', 'han', 'habia', 'haya', 'hizo', 'hace', 'hacia', 'tiene', 'tienen',
    'tuvo', 'tendria', 'puede', 'podria', 'debe', 'necesita', 'quiere', 'cada',
    'algun', 'alguna', 'algunos', 'algunas', 'todo', 'toda', 'todos', 'todas',
    'muy', 'mas', 'menos', 'mucho', 'muchos', 'poco', 'pocos', 'bastante',
    'demasiado', 'casi', 'solo', 'solamente', 'tambien', 'aun', 'ya', 'todavia',
    'siempre', 'nunca', 'jamás', 'ahora', 'hoy', 'manana', 'ayer', 'aqui', 'alli',
    'alli', 'luego', 'entonces', 'asi', 'como', 'cuando', 'donde', 'porque',
    'por que', 'quien', 'cual', 'cuales', 'cuanto', 'cuanta', 'cuantos', 'cuantas',
  ]);

  return question
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
}

/**
 * Filtra noticias por relevancia respecto a una pregunta de mercado.
 *
 * Comprueba si alguna keyword de la pregunta aparece en el headline o summary.
 * Es case-insensitive y ignora acentos basicos.
 *
 * @param {Object[]} news - Array de noticias normalizadas.
 * @param {string} question - Pregta del mercado.
 * @returns {Object[]} Noticias filtradas por relevancia.
 */
export function filterNewsByRelevance(news, question) {
  const keywords = extractKeywords(question);
  if (keywords.length === 0) return news;

  const keywordSet = new Set(keywords);
  return news.filter((item) => {
    const text = `${item.headline} ${item.summary}`.toLowerCase();
    return Array.from(keywordSet).some((kw) => text.includes(kw));
  });
}

/**
 * Obtiene noticias generales de mercado de los ultimos N dias.
 *
 * @param {number} [daysBack=7]
 * @returns {Promise<Object[]>}
 */
export async function fetchFinancialNews(daysBack = 7) {
  try {
    const general = await getMarketNews('general', 50);
    const forex = await getMarketNews('forex', 20);
    const crypto = await getMarketNews('crypto', 20);
    return [...general, ...forex, ...crypto];
  } catch (err) {
    logger.warn({ err: err.message }, 'fetchFinancialNews failed, returning empty array');
    return [];
  }
}

/**
 * Obtiene titulares financieros para multiples simbolos,
 * adaptados para el pipeline de procesamiento de IA.
 *
 * Limita a maximo 5 simbolos por llamada para respetar el rate limit
 * de 60 llamadas/minuto de Finnhub (free tier).
 *
 * @param {Object} [params={}]
 * @param {string[]} [params.symbols=[]]
 * @param {number} [params.daysBack=7]
 * @param {number} [params.limitPerSymbol=20]
 * @returns {Promise<Object[]>}
 */
export async function fetchHeadlinesForPipeline({
  symbols = [],
  daysBack = 7,
  limitPerSymbol = 20,
} = {}) {
  if (!symbols.length) return [];

  const limitedSymbols = symbols.slice(0, MAX_SYMBOLS_PER_PIPELINE_CALL);
  if (symbols.length > MAX_SYMBOLS_PER_PIPELINE_CALL) {
    logger.warn(
      { requested: symbols.length, allowed: MAX_SYMBOLS_PER_PIPELINE_CALL },
      'fetchHeadlinesForPipeline truncated symbols to respect rate limit',
    );
  }

  const promises = limitedSymbols.map(async (s) => {
    try {
      const items = await getCompanyNews(s, daysBack);
      return items.slice(0, limitPerSymbol).map((it) => ({ symbol: s, ...it }));
    } catch (err) {
      logger.warn({ err: err.message, symbol: s }, 'getCompanyNews failed for symbol');
      return [];
    }
  });
  const results = await Promise.all(promises);
  return results.flat();
}
