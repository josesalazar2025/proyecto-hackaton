/**
 * Cliente para la API de Finnhub — noticias financieras.
 *
 * Exporta:
 *   - fetchFinancialNews(limit): obtiene headlines de Finnhub.
 *   - filterNewsByRelevance(news, question): filtra noticias por relevancia
 *     con el texto de la pregunta del mercado.
 */

import { config } from '../config.js';
import { logger } from '../utils/logger.js';

const FINNHUB_BASE = 'https://finnhub.io/api/v1';

/**
 * Obtiene noticias financieras generales de Finnhub.
 * @param {number} limit - Máximo de noticias a devolver.
 * @returns {Promise<Array<{headline:string, source:string, url:string, summary:string, datetime:number}>>}
 */
export async function fetchFinancialNews(limit = 30) {
  if (!config.FINNHUB_API_KEY) {
    logger.warn('FINNHUB_API_KEY not set; skipping news fetch');
    return [];
  }

  const url = `${FINNHUB_BASE}/news?category=general&token=${config.FINNHUB_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Finnhub returned ${res.status}`);
  }

  const data = await res.json();
  if (!Array.isArray(data)) {
    return [];
  }

  // Finnhub devuelve: { category, datetime, headline, id, image, related, source, summary, url }
  return data.slice(0, limit).map((item) => ({
    headline: item.headline || '',
    source: item.source || '',
    url: item.url || '',
    summary: item.summary || '',
    datetime: item.datetime || 0,
  }));
}

/**
 * Filtra noticias por relevancia respecto a la pregunta del mercado.
 * Usa coincidencia de palabras clave extraídas de la pregunta.
 * @param {Array} news - Lista de noticias.
 * @param {string} question - Pregunta del mercado.
 * @returns {Array} Noticias relevantes.
 */
export function filterNewsByRelevance(news, question) {
  if (!news || !news.length || !question) return [];

  // Extrae palabras clave: elimina stopwords en español/inglés y puntuación
  const stopwords = new Set([
    'a','an','the','and','or','but','in','on','at','to','for','of','with','by','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','can','shall','this','that','these','those','i','you','he','she','it','we','they','me','him','her','us','them','my','your','his','its','our','their','mine','yours','hers','ours','theirs','el','la','los','las','un','una','unos','unas','y','o','pero','en','de','con','por','para','es','son','fue','fueron','ser','estar','ha','han','había','hace','hizo','hacer','este','ese','esta','esa','estos','esas','aquellos','aquel','aquella','yo','tú','él','ella','nosotros','vosotros','ellos','ellas','me','te','le','les','nos','os','mi','tu','su','nuestro','vuestra','suyo',
  ]);

  const keywords = question
    .toLowerCase()
    .replace(/[^a-záéíóúüñ0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopwords.has(w));

  if (!keywords.length) return news.slice(0, 5);

  return news.filter((item) => {
    const text = `${item.headline} ${item.summary}`.toLowerCase();
    return keywords.some((kw) => text.includes(kw));
  });
}
