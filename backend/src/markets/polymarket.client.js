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

export function mapMarket(raw) {
  const { yesPrice, noPrice } = parsePrices(raw.outcomePrices);
  const eventTitle = raw.events?.[0]?.title || '';
  const question = raw.question || '';

  return {
    id: String(raw.id),
    question,
    category: inferCategory(question, eventTitle),
    countryCode: inferCountryCode(question, eventTitle),
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
