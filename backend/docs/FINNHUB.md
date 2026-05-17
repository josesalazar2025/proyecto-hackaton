# FINNHUB.md — Modulo de noticias financieras

Fuente de titulares financieros para el pipeline de IA. Consulta la API REST de Finnhub (free tier) y proporciona noticias filtradas por relevancia al mercado analizado.

**No expone endpoints REST publicos.** Es un modulo interno consumido unicamente por `signals/aiPipeline.js` durante la generacion de senales (cada 5 min).

---

## Variables de entorno

| Variable | Obligatoria | Descripcion |
|---|---|---|
| `FINNHUB_API_KEY` | No | API key de Finnhub (finnhub.io). Sin ella el modulo devuelve array vacio y el pipeline usa rule-based. |

---

## API interna

### `getMarketNews(category, limit)`

**Archivo:** `src/finnhub/finnhub.client.js`

Obtiene noticias generales del mercado por categoria.

**Parametros**

| Param | Tipo | Default | Descripcion |
|---|---|---|---|
| `category` | string | `"general"` | Categoria: `general`, `forex`, `crypto`, `merger` |
| `limit` | int | `50` | Maximo de noticias a devolver |

**Retorno:** `Promise<Object[]>` — array de noticias normalizadas.

**Noticia normalizada:**

```json
{
  "id": 12345,
  "headline": "Fed signals potential rate cut...",
  "summary": "The Federal Reserve hinted at...",
  "url": "https://example.com/news/12345",
  "source": "Reuters",
  "related": "AAPL",
  "datetime": "2026-05-15T14:30:00.000Z"
}
```

---

### `getCompanyNews(symbol, daysBack)`

**Archivo:** `src/finnhub/finnhub.client.js`

Obtiene noticias de una empresa especifica en un rango de fechas.

**Parametros**

| Param | Tipo | Default | Descripcion |
|---|---|---|---|
| `symbol` | string | — | Simbolo bursatil (ej. `AAPL`, `TSLA`, `BTC`) |
| `daysBack` | int | `7` | Dias hacia atras desde hoy |

**Retorno:** `Promise<Object[]>` — noticias normalizadas de la empresa.

---

### `fetchFinancialNews(daysBack)`

**Archivo:** `src/finnhub/finnhub.service.js`

Agrega noticias de multiples categorias (`general`, `forex`, `crypto`) para el pipeline de IA.

**Parametros**

| Param | Tipo | Default | Descripcion |
|---|---|---|---|
| `daysBack` | int | `7` | No aplica directamente; se usa el rango por defecto de Finnhub |

**Retorno:** `Promise<Object[]>` — hasta 90 noticias agregadas (50 general + 20 forex + 20 crypto).

---

### `filterNewsByRelevance(news, question)`

**Archivo:** `src/finnhub/finnhub.service.js`

Filtra noticias por keywords extraidas de la pregunta del mercado. Elimina stop words en ingles y espanol; matching case-insensitive.

**Parametros**

| Param | Tipo | Descripcion |
|---|---|---|
| `news` | Object[] | Array de noticias normalizadas |
| `question` | string | Pregta del mercado (ej. "Will Bitcoin reach $100k?") |

**Retorno:** `Object[]` — noticias que contienen al menos una keyword en `headline` o `summary`.

---

### `fetchHeadlinesForPipeline({ symbols, daysBack, limitPerSymbol })`

**Archivo:** `src/finnhub/finnhub.service.js`

Obtiene noticias de multiples simbolos en paralelo, truncando a maximo 5 simbolos para respetar el rate limit.

**Parametros**

| Param | Tipo | Default | Descripcion |
|---|---|---|---|
| `symbols` | string[] | `[]` | Lista de simbolos bursatiles |
| `daysBack` | int | `7` | Dias hacia atras |
| `limitPerSymbol` | int | `20` | Maximo de noticias por simbolo |

**Retorno:** `Promise<Object[]>` — noticias agregadas con campo `symbol` anadido.

**Limitacion:** si `symbols.length > 5`, se trunca a 5 y se emite warning en logs.

---

## Pipeline de noticias dentro de la generacion de senales

```
scheduler.js (cada 5 min)
    ↓
aiPipeline.run(market)
    ↓ Paso 1: Obtener noticias
    fetchFinancialNews()           → general + forex + crypto
    ↓ Paso 2: Filtrar por relevancia
    filterNewsByRelevance(news, market.question)
    ↓ Paso 3: Filtrar por sentimiento (FinBERT)
    filterWithFinBERT(headlines)
    ↓ Paso 4: Generar senal (Qwen3-8B / OpenRouter / rule-based)
```

**Nota:** si Finnhub no esta configurado o falla, los pasos 1-2 devuelven array vacio y el pipeline continua con rule-based usando el precio del mercado.

---

## Rate limiter y restricciones

| Restriccion | Implementacion |
|---|---|
| **Free tier: 60 llamadas/min** | Rate limiter en memoria en `finnhub.client.js`. Si se excede, devuelve `[]`. |
| **Sin API key** | `ensureApiKey()` devuelve `false`; todas las funciones retornan `[]` sin lanzar error. |
| **Sin endpoints REST** | El modulo es puramente interno; no se expone via HTTP. |
| **Limite de 5 simbolos** | `fetchHeadlinesForPipeline` trunca `symbols` a 5 para no saturar el rate limit. |
| **Errores de red** | Capturados internamente; se loguean como `warn` y se retorna `[]`. |

**Calculo de uso tipico:**
- `fetchFinancialNews()` = 3 llamadas (general + forex + crypto)
- Top 20 mercados cada 5 min = 20 x 3 = 60 llamadas/5min (en el limite exacto del free tier)

---

## Ejemplo de uso interno

```js
// Desde aiPipeline.js
import { fetchFinancialNews, filterNewsByRelevance } from '../finnhub/finnhub.service.js';

async function run(market) {
  // 1. Obtener noticias
  const allNews = await fetchFinancialNews(30);

  // 2. Filtrar por relevancia respecto al mercado
  const relevant = filterNewsByRelevance(allNews, market.question);

  // 3. Continuar con FinBERT + Qwen3-8B...
}
```

---

## Logs esperados

```
# Sin API key configurada
[DEBUG] Finnhub API key not configured, returning empty array

# Rate limit excedido
[WARN] Finnhub rate limit exceeded (60 calls/min), returning empty array

# Pipeline continua sin noticias
[WARN] news fetch failed, continuing without news
```

---

## Archivos del modulo

```
backend/src/finnhub/
├── finnhub.client.js   # Cliente HTTP + rate limiter
└── finnhub.service.js  # Logica de negocio y filtrado
```

---

*Ultima actualizacion: mayo 2026*
