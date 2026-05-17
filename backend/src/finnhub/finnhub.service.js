/**
 * Logica de negocio del modulo de noticias Finnhub.
 *
 * Responsabilidades:
 *   - fetchFinancialNewsForMarket(market) → obtiene noticias financieras
 *     RELEVANTES para un mercado especifico de Polymarket.
 *   - Mapeo inteligente de mercados a simbolos bursatiles (bitcoin → BTC, Coinbase, etc.)
 *   - Deduplicacion, scoring de relevancia, y limitacion.
 *
 * Filosofia:
 *   Finnhub cubre noticias financieras. Si un mercado de Polymarket NO tiene
 *   correlacion financiera directa (ej: GTA VI, Weinstein, deportes), NO enviamos
 *   noticias irrelevantes de bitcoin. En esos casos, Qwen analiza solo el precio
 *   del mercado y momentum.
 *
 *   Si el mercado SI tiene correlacion financiera (bitcoin, crypto, stocks, forex),
 *   buscamos noticias especificas de los simbolos/sectores asociados usando
 *   company-news de Finnhub para mayor precision.
 *
 * Mejoras:
 *   - Cache TTL de 5 min para company-news por simbolo.
 *   - Deduplicacion por headline normalizado.
 *   - Maximo 8 noticias relevantes por mercado.
 *   - Shuffle para diversidad entre mercados.
 *
 * Consumido por:
 *   - signals/aiPipeline.js → fase 1 de filtrado de noticias.
 */

import { getCompanyNews, getMarketNews } from './finnhub.client.js';
import { logger } from '../utils/logger.js';

const MAX_NEWS_PER_MARKET = 8;
const NEWS_CACHE_TTL_MS = 30 * 1000; // 30 segundos (noticias frescas)

// Cache por simbolo
const companyNewsCache = new Map(); // symbol → { data, timestamp }
const generalNewsCache = { data: null, timestamp: 0 };

// ── Mapeo inteligente: mercados → simbolos financieros ────────────────────────

const FINANCIAL_KEYWORDS = {
  // Crypto
  bitcoin: ['BTC', 'COIN', 'MSTR', 'RIOT', 'MARA'],
  btc: ['BTC', 'COIN', 'MSTR'],
  crypto: ['COIN', 'BTC', 'ETH', 'SOL', 'MSTR'],
  ethereum: ['ETH', 'COIN'],
  eth: ['ETH', 'COIN'],
  solana: ['SOL', 'COIN'],
  blockchain: ['COIN', 'BTC', 'IBM'],
  altcoin: ['COIN', 'ETH', 'SOL'],
  defi: ['COIN', 'ETH'],
  stablecoin: ['COIN', 'CRCL'],

  // Forex / Macro
  dollar: ['DXY', 'UUP'],
  euro: ['FXE'],
  yen: ['FXY'],
  pound: ['FXB'],
  inflation: ['DXY', 'TLT', 'GLD'],
  cpi: ['SPY', 'TLT', 'GLD'],
  recession: ['SPY', 'QQQ', 'VIX', 'TLT'],
  'interest rate': ['TLT', 'TBT', 'DXY'],
  'rate cut': ['TLT', 'SPY', 'QQQ'],
  'rate hike': ['TBT', 'DXY'],
  fed: ['TLT', 'SPY', 'DXY'],
  powell: ['TLT', 'SPY'],
  ecb: ['FXE', 'EWG'],
  boj: ['FXY', 'EWJ'],
  unemployment: ['SPY', 'TLT'],
  gdp: ['SPY', 'DXY'],
  tariff: ['SPY', 'FXI', 'XLI'],
  'trade war': ['FXI', 'SPY', 'GLD'],

  // Tech / Stocks
  apple: ['AAPL'],
  tesla: ['TSLA'],
  nvidia: ['NVDA'],
  amazon: ['AMZN'],
  google: ['GOOGL'],
  microsoft: ['MSFT'],
  meta: ['META'],
  facebook: ['META'],
  openai: ['MSFT', 'NVDA'],
  anthropic: ['GOOGL', 'AMZN'],
  'artificial intelligence': ['NVDA', 'MSFT', 'GOOGL', 'META'],
  ai: ['NVDA', 'MSFT', 'GOOGL', 'META'],
  semiconductor: ['NVDA', 'TSM', 'AVGO', 'AMD'],
  chip: ['NVDA', 'TSM', 'AVGO', 'AMD'],
  spacex: ['TSLA', 'RKLB'],
  starlink: ['TSLA'],
  boeing: ['BA'],
  airbus: ['EADSY'],

  // Commodities
  gold: ['GLD', 'IAU'],
  silver: ['SLV'],
  oil: ['USO', 'XLE'],
  energy: ['XLE', 'USO'],
  natgas: ['UNG'],
  uranium: ['URA', 'CCJ'],

  // Market indices
  's&p': ['SPY', 'SPX'],
  sp500: ['SPY'],
  nasdaq: ['QQQ'],
  'stock market': ['SPY', 'QQQ', 'VIX'],
  vix: ['VIX', 'SPY'],

  // Geopolitical risk (afecta mercados) - elections impact VIX/DXY/defense
  war: ['GLD', 'USO', 'DXY', 'VIX', 'LMT', 'RTX'],
  conflict: ['GLD', 'USO', 'VIX', 'LMT'],
  invasion: ['GLD', 'USO', 'VIX', 'LMT'],
  ceasefire: ['SPY', 'USO'],
  sanctions: ['USO', 'GLD', 'DXY'],
  iran: ['USO', 'GLD', 'LMT'],
  israel: ['USO', 'GLD', 'LMT'],
  gaza: ['USO', 'GLD'],
  hamas: ['USO', 'GLD'],
  hezbollah: ['USO', 'GLD'],
  ukraine: ['USO', 'GLD', 'LMT', 'RTX'],
  russia: ['USO', 'GLD', 'LMT'],
  putin: ['USO', 'GLD', 'LMT'],
  china: ['FXI', 'USO', 'SPY'],
  xi: ['FXI', 'SPY'],
  taiwan: ['TSM', 'FXI', 'LMT'],
  'north korea': ['LMT', 'EWY'],
  venezuela: ['USO'],
  saudi: ['USO', 'XLE'],
  opec: ['USO', 'XLE'],

  // Politica USA - mueve VIX/DXY/SPY
  trump: ['SPY', 'DXY', 'VIX', 'XLE'],
  biden: ['SPY', 'DXY', 'VIX'],
  harris: ['SPY', 'VIX'],
  desantis: ['SPY', 'XLE'],
  vance: ['SPY', 'XLE'],
  election: ['SPY', 'VIX', 'DXY'],
  'presidential election': ['SPY', 'VIX', 'DXY', 'GLD'],
  republican: ['SPY', 'XLE', 'LMT'],
  democrat: ['SPY', 'TLT'],
  congress: ['SPY', 'TLT'],
  senate: ['SPY', 'TLT'],
  shutdown: ['SPY', 'TLT', 'VIX'],
  'debt ceiling': ['TLT', 'GLD', 'DXY'],
  impeach: ['SPY', 'VIX'],
  scotus: ['SPY'],
  'supreme court': ['SPY'],

  // Politica internacional
  macron: ['EWQ', 'FXE'],
  'le pen': ['EWQ', 'FXE'],
  merkel: ['EWG', 'FXE'],
  scholz: ['EWG', 'FXE'],
  meloni: ['EWI', 'FXE'],
  starmer: ['EWU', 'FXB'],
  milei: ['ARGT'],
  lula: ['EWZ'],
  bolsonaro: ['EWZ'],
  erdogan: ['TUR'],
  modi: ['INDA'],
  zelensky: ['USO', 'LMT'],
  netanyahu: ['USO', 'GLD'],

  // Entretenimiento con accionables financieros
  netflix: ['NFLX'],
  disney: ['DIS'],
  marvel: ['DIS'],
  spotify: ['SPOT'],
  paramount: ['PARA'],
  warner: ['WBD'],
  'box office': ['DIS', 'WBD', 'NFLX'],
  oscar: ['NFLX', 'DIS', 'WBD'],
  gta: ['TTWO'],
  rockstar: ['TTWO'],
  'video game': ['TTWO', 'EA', 'ATVI'],

  // Salud / pandemia
  vaccine: ['PFE', 'MRNA', 'JNJ'],
  fda: ['PFE', 'MRNA', 'LLY'],
  pandemic: ['PFE', 'MRNA', 'VIX'],
  'avian flu': ['PFE', 'MRNA'],
  ozempic: ['NVO', 'LLY'],

  // Clima/eventos
  hurricane: ['XLE', 'HD', 'LOW'],
  climate: ['ICLN', 'TAN', 'XLE'],
};

/**
 * Detecta si una pregunta de mercado tiene correlacion financiera
 * y devuelve los simbolos bursatiles relevantes.
 */
function extractFinancialSymbols(question) {
  if (!question) return { hasFinancialCorrelation: false, symbols: [] };

  const lower = question.toLowerCase();
  const matchedSymbols = new Set();
  const matchedKeywords = [];

  for (const [keyword, symbols] of Object.entries(FINANCIAL_KEYWORDS)) {
    // Match palabra completa o substring
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b|${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    if (regex.test(lower)) {
      symbols.forEach((s) => matchedSymbols.add(s));
      matchedKeywords.push(keyword);
    }
  }

  return {
    hasFinancialCorrelation: matchedSymbols.size > 0,
    symbols: Array.from(matchedSymbols),
    keywords: matchedKeywords,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function deduplicateNews(news) {
  const seen = new Set();
  return news.filter((item) => {
    const normalized = normalizeText(item.headline);
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function scoreRelevance(item, marketKeywords) {
  if (!marketKeywords.length) return 0;

  const textHeadline = normalizeText(item.headline);
  const textSummary = normalizeText(item.summary);
  let score = 0;

  for (const kw of marketKeywords) {
    if (textHeadline.includes(kw)) score += 3;
    if (textSummary.includes(kw)) score += 1;
  }

  // Bonus recencia
  if (item.datetime) {
    const ageHours = (Date.now() - new Date(item.datetime).getTime()) / (1000 * 60 * 60);
    if (ageHours < 6) score += 2;
    else if (ageHours < 24) score += 1;
  }

  return score;
}

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

// ── Cache helpers ─────────────────────────────────────────────────────────────

function getCachedCompanyNews(symbol) {
  const cached = companyNewsCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < NEWS_CACHE_TTL_MS) {
    return cached.data;
  }
  return null;
}

function setCachedCompanyNews(symbol, data) {
  companyNewsCache.set(symbol, { data, timestamp: Date.now() });
}

function getCachedGeneralNews() {
  if (generalNewsCache.data && Date.now() - generalNewsCache.timestamp < NEWS_CACHE_TTL_MS) {
    return generalNewsCache.data;
  }
  return null;
}

function setCachedGeneralNews(data) {
  generalNewsCache.data = data;
  generalNewsCache.timestamp = Date.now();
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Obtiene noticias financieras RELEVANTES para un mercado especifico.
 *
 * Estrategia:
 *   1. Detecta si el mercado tiene correlacion financiera (bitcoin, crypto, etc.)
 *   2. Si SI → busca company-news de los simbolos asociados (muy relevantes)
 *   3. Si NO → devuelve array vacio (Qwen analizara solo el precio)
 *
 * @param {Object} market - Mercado de Polymarket ({ question })
 * @returns {Promise<Object[]>} Noticias relevantes o array vacio.
 */
export async function fetchFinancialNewsForMarket(market) {
  if (!market || !market.question) return [];

  const { hasFinancialCorrelation, symbols, keywords } = extractFinancialSymbols(market.question);

  // Si NO hay correlacion financiera directa, usamos noticias macro generales
  // como contexto (mejor que dejar a la IA sin informacion alguna).
  if (!hasFinancialCorrelation) {
    logger.debug({ marketId: market.id, question: market.question }, 'No financial correlation, using general macro news as context');
    return fetchGeneralMarketNews(15);
  }

  logger.info({ marketId: market.id, symbols, keywords }, 'Fetching company news for financial market');

  // Obtener noticias de cada simbolo (con cache)
  const allNews = [];
  // Fechas dinamicas: alternar entre 1-3 dias para variedad
  const daysBack = 1 + Math.floor(Math.random() * 2); // 1 o 2 dias
  
  for (const symbol of symbols.slice(0, 5)) {
    let news = getCachedCompanyNews(symbol);
    if (!news) {
      try {
        news = await getCompanyNews(symbol, daysBack);
        setCachedCompanyNews(symbol, news);
      } catch (err) {
        logger.warn({ err: err.message, symbol }, 'Failed to fetch company news');
        news = [];
      }
    }
    allNews.push(...news);
  }

  // Complementar con noticias generales del mercado para mas variedad
  try {
    const general = await fetchGeneralMarketNews(10);
    allNews.push(...general);
  } catch (e) { /* ignore */ }

  // Deduplicar y ordenar por recencia
  const deduped = deduplicateNews(allNews);
  deduped.sort((a, b) => {
    const da = a.datetime ? new Date(a.datetime).getTime() : 0;
    const db = b.datetime ? new Date(b.datetime).getTime() : 0;
    return db - da;
  });

  logger.info({ marketId: market.id, count: deduped.length, symbols }, 'Company news fetched');
  return deduped;
}

/**
 * Obtiene noticias generales de mercado (macro).
 * Rota entre multiples categorias para variedad.
 */
export async function fetchGeneralMarketNews(limit = 20) {
  let news = getCachedGeneralNews();
  if (!news) {
    try {
      // Rotar categorias para variedad cada vez
      const categories = ['general', 'forex', 'crypto', 'merger'];
      const shuffledCats = shuffleArray(categories);
      
      const results = await Promise.all(
        shuffledCats.map((cat) => getMarketNews(cat, 25))
      );
      
      news = deduplicateNews(results.flat());
      news.sort((a, b) => {
        const da = a.datetime ? new Date(a.datetime).getTime() : 0;
        const db = b.datetime ? new Date(b.datetime).getTime() : 0;
        return db - da;
      });
      setCachedGeneralNews(news);
    } catch (err) {
      logger.warn({ err: err.message }, 'Failed to fetch general market news');
      return [];
    }
  }
  // Devolver subconjunto aleatorio para variedad entre mercados
  return shuffleArray(news).slice(0, limit);
}

/**
 * Filtra noticias por relevancia respecto a una pregunta de mercado.
 *
 * @param {Object[]} news - Array de noticias normalizadas.
 * @param {string} question - Pregunta del mercado.
 * @returns {Object[]} Noticias filtradas por relevancia (max MAX_NEWS_PER_MARKET).
 */
export function filterNewsByRelevance(news, question) {
  if (!news.length || !question) return [];

  const keywords = extractKeywords(question);
  if (keywords.length === 0) {
    return shuffleArray(news).slice(0, MAX_NEWS_PER_MARKET);
  }

  const scored = news.map((item) => ({
    item,
    score: scoreRelevance(item, keywords),
  }));

  const relevant = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.item);

  // Si hay muy pocas relevantes, complementar
  if (relevant.length < 3) {
    const usedIds = new Set(relevant.map((n) => n.id));
    const extra = shuffleArray(news.filter((n) => !usedIds.has(n.id))).slice(0, MAX_NEWS_PER_MARKET - relevant.length);
    return [...relevant, ...extra].slice(0, MAX_NEWS_PER_MARKET);
  }

  return shuffleArray(relevant.slice(0, MAX_NEWS_PER_MARKET * 2)).slice(0, MAX_NEWS_PER_MARKET);
}

/**
 * Invalida el cache de noticias.
 */
export function invalidateNewsCache() {
  companyNewsCache.clear();
  generalNewsCache.data = null;
  generalNewsCache.timestamp = 0;
  logger.info('News cache invalidated');
}

/**
 * Legacy: obtiene noticias financieras generales (sin correlacion por mercado).
 * @deprecated Usar fetchFinancialNewsForMarket(market) en su lugar.
 */
export async function fetchFinancialNews() {
  return fetchGeneralMarketNews(30);
}

/**
 * Obtiene titulares financieros para multiples simbolos.
 * @deprecated Usar fetchFinancialNewsForMarket(market) en su lugar.
 */
export async function fetchHeadlinesForPipeline({
  symbols = [],
  daysBack = 7,
  limitPerSymbol = 20,
} = {}) {
  if (!symbols.length) return [];

  const allNews = [];
  for (const symbol of symbols.slice(0, 5)) {
    try {
      const items = await getCompanyNews(symbol, daysBack);
      allNews.push(...items.slice(0, limitPerSymbol).map((it) => ({ symbol, ...it })));
    } catch (err) {
      logger.warn({ err: err.message, symbol }, 'getCompanyNews failed for symbol');
    }
  }
  return allNews;
}
