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
