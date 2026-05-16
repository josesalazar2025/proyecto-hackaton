/**
 * Servicio de integracion con Finnhub REST API.
 *
 * Responsabilidades:
 *   - fetchFinancialNews(count) → obtiene titulares de noticias financieras.
 *   - filterNewsByRelevance(articles, question) → filtra por keywords del mercado.
 *
 * Restricciones:
 *   - Free tier: maximo 60 llamadas/minuto.
 *   - Solo se invoca durante la generacion de senales (cada 5 min).
 *   - Si FINNHUB_API_KEY no esta configurado, devuelve array vacio.
 *
 * Consumido por:
 *   - aiPipeline.js → fase 1 de filtrado de noticias.
 */

import { httpGet } from '../utils/httpClient.js';
import { config } from '../config.js';

export async function fetchFinancialNews(count = 30) {
  if (!config.FINNHUB_API_KEY) return [];
  const url = `https://finnhub.io/api/v1/news?category=general&token=${config.FINNHUB_API_KEY}`;
  const articles = await httpGet(url);
  return articles.slice(0, count).map((a) => ({
    headline: a.headline ?? '',
    summary: a.summary ?? '',
  }));
}

export function filterNewsByRelevance(articles, question) {
  const keywords = question
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 4);
  if (keywords.length === 0) return articles;
  return articles.filter((a) => {
    const text = `${a.headline} ${a.summary}`.toLowerCase();
    return keywords.some((kw) => text.includes(kw));
  });
}
