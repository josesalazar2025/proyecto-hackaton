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
import { logger } from '../utils/logger.js';

const GAMMA_MARKETS_URL = 'https://gamma-api.polymarket.com/markets';
const GAMMA_EVENTS_URL = 'https://gamma-api.polymarket.com/events';
const USD_TO_EUR = 0.93;

/**
 * Tags de Polymarket que usamos para fetching diversificado.
 * El endpoint /markets IGNORA tag_id, pero /events lo respeta correctamente.
 * Cada tag aporta N mercados al pool global - el weight controla cuantos.
 *
 * Tags verificados manualmente desde gamma-api.polymarket.com/tags.
 */
const TAG_SLICES = [
  // Financieros directos (mayor peso - mas alpha)
  { tagId: 1312, slug: 'crypto-prices', category: 'cripto', limit: 25 },
  { tagId: 602,  slug: 'stock-market',  category: 'economía', limit: 25 },
  { tagId: 159,  slug: 'fed',           category: 'economía', limit: 15 },
  { tagId: 992,  slug: 'labor-market',  category: 'economía', limit: 10 },
  { tagId: 1562, slug: 'market-caps',   category: 'economía', limit: 10 },

  // Tech / AI (alta accionabilidad)
  { tagId: 1401,   slug: 'tech',        category: 'ciencia', limit: 20 },
  { tagId: 22,     slug: 'technology',  category: 'ciencia', limit: 15 },
  { tagId: 101999, slug: 'big-tech',    category: 'ciencia', limit: 15 },
  { tagId: 537,    slug: 'openai',      category: 'ciencia', limit: 10 },

  // Geopolitica (afecta oil/gold/defense)
  { tagId: 154, slug: 'middle-east',     category: 'geopolítica', limit: 20 },
  { tagId: 78,  slug: 'iran',            category: 'geopolítica', limit: 10 },
  { tagId: 180, slug: 'israel',          category: 'geopolítica', limit: 10 },
  { tagId: 114, slug: 'syria',           category: 'geopolítica', limit: 10 },
  { tagId: 172, slug: 'oil-industry',    category: 'economía', limit: 15 },
  { tagId: 248, slug: 'energy-industry', category: 'economía', limit: 10 },

  // Regional coverage (variedad geografica)
  { tagId: 100410, slug: 'europe',     category: 'geopolítica', limit: 20 },
  { tagId: 167,    slug: 'argentina',  category: 'geopolítica', limit: 10 },
  { tagId: 872,    slug: 'pakistan',   category: 'geopolítica', limit: 10 },
  { tagId: 525,    slug: 'netherlands', category: 'geopolítica', limit: 5 },
  { tagId: 258,    slug: 'taiwan-election', category: 'geopolítica', limit: 8 },
  { tagId: 104846, slug: 'uk-elections',    category: 'política',    limit: 8 },
  { tagId: 103388, slug: 'thailand-election', category: 'geopolítica', limit: 5 },
  { tagId: 104090, slug: 'french-mayoral',  category: 'política',    limit: 5 },
  { tagId: 104968, slug: 'mexico-election', category: 'política',    limit: 8 },
  { tagId: 103219, slug: 'bolivia-election', category: 'política',   limit: 5 },

  // Politica (peso moderado - es donde hay mas volumen)
  { tagId: 2,   slug: 'politics',          category: 'política', limit: 15 },
  { tagId: 789, slug: 'us-politics',       category: 'política', limit: 10 },
  { tagId: 126, slug: 'trump',             category: 'política', limit: 10 },

  // Corporativo / clima / cultura
  { tagId: 550,    slug: 'corporate-news',   category: 'economía', limit: 15 },
  { tagId: 102890, slug: 'climate-change',   category: 'ciencia',  limit: 10 },
  { tagId: 596,    slug: 'pop-culture',      category: 'entretenimiento', limit: 10 },
  { tagId: 100451, slug: 'breaking',         category: 'general',  limit: 15 },
];

function mapStatus({ closed, archived }) {
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

function inferCategory(question, eventTitle = '') {
  const text = `${question} ${eventTitle}`.toLowerCase();

  const rules = [
    { keywords: ['bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'blockchain', 'solana', 'cardano', 'altcoin', 'defi', 'nft'], category: 'cripto' },
    { keywords: ['fed', 'ecb', 'rate', 'interest', 'inflation', 'gdp', 'recession', 'economy', 'tariff', 'trade', 'dollar', 'euro', 'yen', 'bank', 'finance', 'stock market', 'sp500', 'nasdaq', 'unemployment', 'cpi', 'ppi'], category: 'economía' },
    { keywords: ['trump', 'biden', 'election', 'president', 'democrat', 'republican', 'congress', 'senate', 'house', 'vote', 'impeach', 'nominee', 'primary', 'governor', 'mayor', 'political', 'politics', 'campaign'], category: 'política' },
    { keywords: ['war', 'ukraine', 'russia', 'putin', 'china', 'xi', 'iran', 'israel', 'gaza', 'north korea', 'taiwan', 'invasion', 'missile', 'nuclear', 'sanctions', 'diplomatic', 'embassy', 'conflict'], category: 'geopolítica' },
    { keywords: ['super bowl', 'world cup', 'olympics', 'nba', 'nfl', 'mlb', 'soccer', 'football', 'tennis', 'golf', 'mvp', 'championship', 'fifa', 'uefa', 'premier league', 'playoff'], category: 'deportes' },
    { keywords: ['album', 'movie', 'oscar', 'grammy', 'emmy', 'hollywood', 'actor', 'singer', 'celebrity', 'gta', 'video game', 'song', 'chart', 'streaming', 'netflix', 'disney', 'marvel', 'rockstar'], category: 'entretenimiento' },
    { keywords: ['ai', 'spacex', 'mars', 'rocket', 'vaccine', 'climate', 'covid', 'pandemic', 'tesla', 'elon', 'neuralink', 'fusion', 'crispr'], category: 'ciencia' },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((kw) => text.includes(kw))) {
      return rule.category;
    }
  }

  return 'general';
}

function inferCountryCode(question, eventTitle = '') {
  // Envolver con espacios para evitar coincidencias parciales de substrings
  const text = ` ${question} ${eventTitle} `.toLowerCase();

  const rules = [
    // Estados Unidos
    { keywords: [' usa ', ' us ', ' america ', ' american ', ' trump ', ' biden ', ' clinton ', ' obama ', ' harris ', ' pence ', ' sanders ', ' warren ', ' mcconnell ', ' pelosi ', ' schumer ', ' congress ', ' senate ', ' house of representatives ', ' fed ', ' super bowl ', ' nba ', ' nfl ', ' mlb ', ' nasdaq ', ' sp500 ', ' hollywood ', ' california ', ' new york ', ' texas ', ' florida ', ' white house ', ' pentagon ', ' supreme court ', ' capitol ', ' governor of ', ' democratic nomination ', ' republican nomination ', ' presidential '], code: 'US' },
    // Reino Unido
    { keywords: [' uk ', ' britain ', ' british ', ' england ', ' london ', ' brexit ', ' boe ', ' pound ', ' sterling ', ' scotland ', ' wales ', ' king charles ', ' prime minister ', ' parliament ', ' westminster ', ' tory ', ' labour party '], code: 'GB' },
    // Alemania
    { keywords: [' germany ', ' german ', ' merkel ', ' scholz ', ' berlin ', ' bundestag ', ' deutsche '], code: 'DE' },
    // Francia
    { keywords: [' france ', ' french ', ' macron ', ' paris ', ' le pen ', ' élysée '], code: 'FR' },
    // Italia
    { keywords: [' italy ', ' italian ', ' meloni ', ' rome ', ' berlusconi '], code: 'IT' },
    // España
    { keywords: [' spain ', ' spanish ', ' sánchez ', ' madrid ', ' catalonia ', ' catalan '], code: 'ES' },
    // China
    { keywords: [' china ', ' chinese ', ' xi jinping ', ' beijing ', ' shanghai ', ' hong kong ', ' taiwan ', ' yuan ', ' alibaba ', ' byd '], code: 'CN' },
    // Rusia
    { keywords: [' russia ', ' russian ', ' putin ', ' moscow ', ' kremlin ', ' ruble '], code: 'RU' },
    // India
    { keywords: [' india ', ' indian ', ' modi ', ' mumbai ', ' delhi ', ' rupee ', ' bjp '], code: 'IN' },
    // Brasil
    { keywords: [' brazil ', ' brazilian ', ' brasil ', ' lula ', ' bolsonaro ', ' real '], code: 'BR' },
    // Japón
    { keywords: [' japan ', ' japanese ', ' tokyo ', ' boj ', ' yen ', ' nikkei ', ' suzuki '], code: 'JP' },
    // Canadá
    { keywords: [' canada ', ' canadian ', ' trudeau ', ' toronto ', ' loonie '], code: 'CA' },
    // Ucrania
    { keywords: [' ukraine ', ' ukrainian ', ' kyiv ', ' zelensky '], code: 'UA' },
    // Israel
    { keywords: [' israel ', ' israeli ', ' gaza ', ' netanyahu ', ' palestine ', ' palestinian ', ' hamas '], code: 'IL' },
    // Irán
    { keywords: [' iran ', ' iranian ', ' tehran ', ' ayatollah '], code: 'IR' },
    // Corea
    { keywords: [' korea ', ' north korea ', ' south korea ', ' korean ', ' seoul ', ' kim jong '], code: 'KR' },
    // Australia
    { keywords: [' australia ', ' australian ', ' sydney ', ' rba ', ' aud '], code: 'AU' },
    // México
    { keywords: [' mexico ', ' mexican ', ' peso ', ' amlo ', ' mexican president '], code: 'MX' },
    // Turquía
    { keywords: [' turkey ', ' turkish ', ' erdogan ', ' lira ', ' istanbul '], code: 'TR' },
    // Arabia Saudita
    { keywords: [' saudi ', ' saudi arabia ', ' riyadh ', ' aramco '], code: 'SA' },
    // Sudáfrica
    { keywords: [' south africa ', ' south african ', ' johannesburg ', ' rand '], code: 'ZA' },
    // Argentina
    { keywords: [' argentina ', ' argentinian ', ' milei ', ' buenos aires ', ' peso argentino '], code: 'AR' },
    // Uzbekistán
    { keywords: [' uzbekistan ', ' uzbek '], code: 'UZ' },
    // Nueva Zelanda
    { keywords: [' new zealand ', ' kiwi '], code: 'NZ' },
    // Países Bajos
    { keywords: [' netherlands ', ' dutch ', ' amsterdam ', ' rutte '], code: 'NL' },
    // Polonia
    { keywords: [' poland ', ' polish ', ' warsaw ', ' duda '], code: 'PL' },
    // Suiza
    { keywords: [' switzerland ', ' swiss ', ' zurich ', ' geneva ', ' franc '], code: 'CH' },
    // Suecia
    { keywords: [' sweden ', ' swedish ', ' stockholm '], code: 'SE' },
    // Noruega
    { keywords: [' norway ', ' norwegian ', ' oslo '], code: 'NO' },
    // Dinamarca
    { keywords: [' denmark ', ' danish ', ' copenhagen '], code: 'DK' },
    // Finlandia
    { keywords: [' finland ', ' finnish ', ' helsinki '], code: 'FI' },
    // Grecia
    { keywords: [' greece ', ' greek ', ' athens '], code: 'GR' },
    // Portugal
    { keywords: [' portugal ', ' portuguese ', ' lisbon '], code: 'PT' },
    // Bélgica
    { keywords: [' belgium ', ' belgian ', ' brussels '], code: 'BE' },
    // Austria
    { keywords: [' austria ', ' austrian ', ' vienna '], code: 'AT' },
    // Irlanda
    { keywords: [' ireland ', ' irish ', ' dublin '], code: 'IE' },
    // Pakistán
    { keywords: [' pakistan ', ' pakistani ', ' islamabad '], code: 'PK' },
    // Bangladés
    { keywords: [' bangladesh ', ' bangladeshi ', ' dhaka '], code: 'BD' },
    // Indonesia
    { keywords: [' indonesia ', ' indonesian ', ' jakarta '], code: 'ID' },
    // Filipinas
    { keywords: [' philippines ', ' filipino ', ' manila '], code: 'PH' },
    // Vietnam
    { keywords: [' vietnam ', ' vietnamese ', ' hanoi '], code: 'VN' },
    // Tailandia
    { keywords: [' thailand ', ' thai ', ' bangkok '], code: 'TH' },
    // Malasia
    { keywords: [' malaysia ', ' malaysian ', ' kuala lumpur '], code: 'MY' },
    // Singapur
    { keywords: [' singapore ', ' singaporean '], code: 'SG' },
    // Colombia
    { keywords: [' colombia ', ' colombian ', ' bogotá '], code: 'CO' },
    // Chile
    { keywords: [' chile ', ' chilean ', ' santiago '], code: 'CL' },
    // Perú
    { keywords: [' peru ', ' peruvian ', ' lima '], code: 'PE' },
    // Venezuela
    { keywords: [' venezuela ', ' venezuelan ', ' caracas ', ' maduro '], code: 'VE' },
    // Ecuador
    { keywords: [' ecuador ', ' ecuadorian ', ' quito '], code: 'EC' },
    // Nigeria
    { keywords: [' nigeria ', ' nigerian ', ' lagos ', ' abuja '], code: 'NG' },
    // Egipto
    { keywords: [' egypt ', ' egyptian ', ' cairo '], code: 'EG' },
    // Etiopía
    { keywords: [' ethiopia ', ' ethiopian ', ' addis ababa '], code: 'ET' },
    // Kenia
    { keywords: [' kenya ', ' kenyan ', ' nairobi '], code: 'KE' },
    // Cuba
    { keywords: [' cuba ', ' cuban ', ' havana '], code: 'CU' },
    // República Dominicana
    { keywords: [' dominican republic ', ' dominican '], code: 'DO' },
    // Curazao
    { keywords: [' curaçao ', ' curacao '], code: 'CW' },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((kw) => text.includes(kw))) {
      return rule.code;
    }
  }

  return null;
}

/**
 * Determina si una pregunta de mercado es analizable por la IA con edge plausible.
 *
 * Excluimos:
 *   - "Will X say WORD by date" (sin base de datos predictiva)
 *   - "Mentions" / "first to say" markets
 *   - Mercados de views/views-counts de YouTubers
 *   - "Before GTA VI" type meme markets
 *
 * Mantenemos:
 *   - Precios objetivo (Bitcoin $X by Y)
 *   - Decisiones Fed/ECB/BOE
 *   - Eventos geopoliticos concretos (acuerdos, sanciones, elecciones)
 *   - Cifras macro (CPI, GDP, employment)
 */
function isAnalyzable(question, category) {
  const q = question.toLowerCase();

  // Patrones de mercados NO analizables (memes, predicciones-de-palabras, views)
  const blacklist = [
    /\bsay\b.*\?$/i,           // "Will Trump say X?"
    /how many.*tweet/i,         // tweets count
    /\bmentions?\b/i,
    /\b# of tweets\b/i,
    /views? on day/i,           // MrBeast views
    /views? in /i,
    /before gta/i,              // GTA VI memes
    /jesus christ return/i,
    /alien/i,
    /\bpoll(ed|ing) (above|below)/i,  // detailed polling minutiae
    /first to/i,                // "first to reach X"
    /wear (a|the)/i,            // clothing predictions
    /shave/i,
    /grammy|oscar|emmy/i,       // award shows (subjective)
  ];

  if (blacklist.some((re) => re.test(q))) return false;

  // Categorias inherentemente no analizables sin modelo dedicado
  if (category === 'deportes') return false;
  if (category === 'entretenimiento') return false;

  return true;
}

export function mapMarket(raw, { eventTitle = '', tagCategory = null } = {}) {
  const { yesPrice, noPrice } = parsePrices(raw.outcomePrices);
  const evTitle = eventTitle || raw.events?.[0]?.title || '';
  const question = raw.question || '';

  // Prioriza categoria del tag (proviene de Polymarket directamente)
  // sobre el matcher por keywords, que es ruidoso.
  const category = tagCategory || inferCategory(question, evTitle);

  const spread = raw.spread != null ? parseFloat(raw.spread) : null;
  const bestBid = raw.bestBid != null ? parseFloat(raw.bestBid) : null;
  const bestAsk = raw.bestAsk != null ? parseFloat(raw.bestAsk) : null;

  let clobTokenId = null;
  try {
    const tokens = JSON.parse(raw.clobTokenIds || '[]');
    clobTokenId = tokens[0] ?? null;
  } catch { /* ignorar */ }

  return {
    id: String(raw.id),
    question,
    category,
    countryCode: inferCountryCode(question, evTitle),
    yesPrice,
    noPrice,
    volumeEur: raw.volume != null ? parseFloat(raw.volume) * USD_TO_EUR : null,
    liquidityEur: raw.liquidity != null ? parseFloat(raw.liquidity) * USD_TO_EUR : null,
    spread,
    bestBid,
    bestAsk,
    clobTokenId,
    analyzable: isAnalyzable(question, category),
    status: mapStatus(raw),
    closesAt: raw.endDate ? new Date(raw.endDate) : null,
    lastSynced: new Date(),
  };
}

/**
 * Obtiene eventos de Polymarket filtrados por tag_id ordenados por volumen 24h.
 * Devuelve los markets aplanados de cada evento.
 */
async function fetchEventsByTag(tagId, limit) {
  const url = `${GAMMA_EVENTS_URL}?active=true&closed=false&archived=false&tag_id=${tagId}&order=volume24hr&ascending=false&limit=${limit}`;
  try {
    const events = await httpGet(url);
    if (!Array.isArray(events)) return [];
    const flatMarkets = [];
    for (const ev of events) {
      const evTitle = ev.title || '';
      for (const m of ev.markets || []) {
        // Filtra mercados no activos a nivel de market
        if (m.closed || m.archived || m.active === false) continue;
        flatMarkets.push({ raw: m, eventTitle: evTitle });
      }
    }
    return flatMarkets;
  } catch (err) {
    logger.warn({ err: err.message, tagId }, 'fetchEventsByTag failed');
    return [];
  }
}

/**
 * Obtiene mercados activos de Polymarket de forma DIVERSIFICADA por tag.
 *
 * Problema previo: el endpoint /markets ignora tag_id y devuelve siempre la
 * misma "home feed" de Polymarket (dominada por US politics + World Cup).
 *
 * Solucion: iteramos sobre el endpoint /events (que SI respeta tag_id) con
 * una lista curada de tags de alto valor accionable (cripto, fed, tech,
 * geopolitica, energia, etc) y aplanamos los mercados de cada evento.
 *
 * @returns {Promise<Market[]>} Mercados unicos con categoria asignada por tag.
 */
export async function fetchActiveMarkets() {
  const results = await Promise.all(
    TAG_SLICES.map((slice) => fetchEventsByTag(slice.tagId, slice.limit)),
  );

  // Dedup por id, preservando la categoria de la PRIMERA aparicion
  // (los slices estan ordenados por prioridad de alpha financiero).
  const seen = new Map(); // id → { raw, eventTitle, tagCategory }
  results.forEach((bucket, i) => {
    const tagCategory = TAG_SLICES[i].category;
    for (const { raw, eventTitle } of bucket) {
      const id = String(raw.id);
      if (seen.has(id)) continue;
      seen.set(id, { raw, eventTitle, tagCategory });
    }
  });

  const mapped = Array.from(seen.values()).map(({ raw, eventTitle, tagCategory }) =>
    mapMarket(raw, { eventTitle, tagCategory }),
  );

  // Filtro de calidad: liquidez minima 5000 EUR para excluir orderbooks muertos
  const filtered = mapped.filter((m) => (m.liquidityEur ?? 0) >= 5000 || (m.volumeEur ?? 0) >= 50000);

  logger.info({
    totalFetched: mapped.length,
    afterLiquidityFilter: filtered.length,
    perCategory: filtered.reduce((acc, m) => { acc[m.category] = (acc[m.category]||0)+1; return acc; }, {}),
  }, 'polymarket diversified fetch complete');

  return filtered;
}
