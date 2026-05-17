# PolySignal

Dashboard web de inteligencia de mercados de prediccion en tiempo real.

## Que es

PolySignal analiza mercados de Polymarket cruzando noticias de Finnhub con modelos de IA (ModernFinBERT + Qwen3-8B) para generar senales de trading (alcista, bajista, neutral). Incluye simulador de posiciones con capital virtual, lista de seguimiento y alertas por Telegram.

**No ejecuta ordenes reales.** Es una herramienta de analisis e inteligencia.

**Idioma:** Espanol.
**Moneda base:** Euro (€).

## Stack

- **Backend:** Node.js 26 + Express.js 5 + Socket.io + node-cron
- **ORM:** Prisma 6 + SQLite
- **Frontend:** Vanilla JS + Vite 7 + Leaflet.js + Chart.js + Socket.io client
- **IA:** HuggingFace Spaces (ModernFinBERT + Qwen3-8B) + OpenRouter fallback
- **Datos:** Polymarket Gamma API + Finnhub REST
- **Deploy:** HuggingFace Spaces (Docker, puerto 7860)

## Estado del proyecto

El backend es **totalmente funcional**:

- API REST completa con autenticacion JWT.
- Pipeline de IA con cadena de fallback (Spaces HF → API HF → OpenRouter → rule-based).
- Scheduler de tareas periodicas (sync mercados, generacion de senales, P&L, alertas).
- WebSocket en tiempo real para precios y senales.
- Base de datos SQLite con Prisma ORM

El frontend **consume datos reales del backend** y tiene **fallback a datos mock** cuando el backend no responde (modo demo sin configuracion).

## Mejoras de utilidad

Para que la app sea util mas alla de la demo visual, se han incorporado los siguientes ajustes — todos orientados a que las senales tengan *edge* real y no sean ruido bonito:

### 1. Fetch diversificado por tag (anti-monotonia)

El endpoint `/markets` de Polymarket ignora `tag_id` y siempre devuelve la home feed (politica US + World Cup). El cliente usa ahora el endpoint **`/events`** que SI respeta `tag_id`, con un catalogo curado de ~25 tags de alto valor (crypto-prices, fed, stock-market, tech, openai, middle-east, oil-industry, europe, taiwan-election, etc.) y aplana los mercados por tag.

Resultado: ~1000 mercados activos diarios distribuidos en 6 categorias (cripto, economia, geopolitica, ciencia, politica, entretenimiento) en lugar de los ~100 dominados por una unica categoria.

### 2. Whitelist de mercados analizables

`polymarket.client.js → isAnalyzable()` flaggea como **no analizables** los mercados donde la IA no tiene edge plausible:

- Predicciones de palabras (*"Will Trump say nuclear?"*)
- Views de YouTubers, recuentos de tweets
- "Before GTA VI"-style memes
- Deportes y entretenimiento

`signals.service.js` salta la generacion para estos mercados y el frontend pinta el badge **"FUERA DE ALCANCE"** en lugar de fabricar confianza falsa. Asi, cada senal visible es defendible.

### 3. Ground truth de cripto via CoinGecko

`utils/coingecko.client.js` resuelve spot prices (BTC, ETH, SOL, DOGE, ADA, XRP) y los inyecta en el prompt de la IA para mercados de precio objetivo:

```
GROUND TRUTH: BTC spot $103,400. Target $150,000 (+45.1% required).
Use this to judge whether the implied probability is plausible given typical volatility.
```

Cache TTL 60s — respeta el rate limit gratuito de CoinGecko.

### 4. Edge gap explicito (impliedProb vs fairProb)

Cada `AISignal` persiste ahora `impliedProb`, `fairProb` y `edgePoints`. El pipeline mapea `(signal, confidence) → fairProb`:

| Signal | Formula |
|--------|---------|
| bullish + conf 0.8 | fairProb = 0.5 + 0.8 × 0.5 = 0.90 |
| bearish + conf 0.8 | fairProb = 0.5 − 0.8 × 0.5 = 0.10 |
| neutral | fairProb = 0.5 |

La tarjeta del mercado muestra: `Mercado 65% · IA 78% · Edge +13pp` — claim cuantitativo en lugar de prosa vaga.

### 5. Spread-aware sizing (Kelly con costes)

Polymarket expone `spread`, `bestBid`, `bestAsk` por mercado. `positions/kelly.js → suggestSize()` resta el spread del edge bruto antes de calcular el tamano de posicion:

```
edgeNeto = |edgePoints/100| - spread
fraction = Quarter-Kelly(price, impliedProb + edgeNeto)
amount   = bankroll * min(0.25, fraction)
```

Mercados con `spread > 5¢` se marcan como **ilíquidos** y los botones de compra se desactivan. Endpoint publico: `GET /api/v1/positions/suggestion/:marketId`.

### 6. Distribucion geografica del mapa

`map.js` usa **jitter determinista** (hash del marketId → desplazamiento en bounding-box del pais) para que multiples mercados del mismo pais no se apilen sobre la capital. Mercados sin pais (cripto, indices, AI) se reparten entre **40 hubs financieros** globales (NYC, Sao Paulo, Mumbai, Lagos, Moscu, Yakarta, Sydney, etc.) en vez de caer todos sobre [20,0].

## Estructura

```
polysignal/
├── backend/                      # API REST + Servicios + Scheduler
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma         # Schema SQLite (User, Market, AISignal, Position, Watchlist, Alert)
│   │   ├── migrations/           # Migraciones de Prisma
│   │   └── seed.js               # Usuarios demo (admin + user)
│   └── src/
│       ├── index.js              # Entry point: HTTP server + Socket.io + scheduler
│       ├── app.js                # Express: middlewares + rutas + manejo de errores
│       ├── config.js             # Variables de entorno validadas con Zod
│       ├── scheduler.js          # Jobs periodicos (cron): sync, senales IA, PnL, alertas
│       ├── auth/                 # Autenticacion JWT + bcrypt
│       │   ├── auth.controller.js
│       │   ├── auth.service.js
│       │   ├── auth.routes.js
│       │   ├── auth.validators.js
│       │   └── jwt.js
│       ├── markets/              # Mercados de Polymarket
│       │   ├── markets.controller.js
│       │   ├── markets.service.js
│       │   ├── markets.routes.js
│       │   ├── markets.validators.js
│       │   ├── markets.repository.js
│       │   └── polymarket.client.js
│       ├── signals/              # Pipeline de IA (ModernFinBERT + Qwen3-8B)
│       │   ├── signals.controller.js
│       │   ├── signals.service.js
│       │   ├── signals.routes.js
│       │   ├── signals.repository.js
│       │   ├── aiPipeline.js     # Pipeline IA con fallback chain
│       │   └── finnhub.client.js # Noticias financieras
│       ├── positions/            # Simulador de posiciones virtuales
│       │   ├── positions.controller.js
│       │   ├── positions.service.js
│       │   ├── positions.routes.js
│       │   ├── positions.validators.js
│       │   ├── positions.repository.js
│       │   └── kelly.js          # Criterio de Kelly (sizing)
│       ├── watchlist/            # Lista de seguimiento
│       │   ├── watchlist.controller.js
│       │   ├── watchlist.service.js
│       │   ├── watchlist.routes.js
│       │   ├── watchlist.validators.js
│       │   └── watchlist.repository.js
│       ├── alerts/               # Alertas por Telegram
│       │   ├── alerts.controller.js
│       │   ├── alerts.service.js
│       │   ├── alerts.routes.js
│       │   ├── alerts.repository.js
│       │   └── telegram.client.js
│       ├── middlewares/          # Middlewares reutilizables
│       │   ├── validate.js       # Validacion Zod generica
│       │   ├── requireAuth.js    # Autenticacion JWT
│       │   ├── rateLimitLogin.js # Rate limit login
│       │   ├── errorHandler.js   # Manejo centralizado de errores
│       │   └── notFound.js       # 404
│       ├── utils/                # Utilidades compartidas
│       │   ├── apiResponse.js    # Helpers de respuesta HTTP
│       │   ├── httpClient.js     # Cliente HTTP con retry + timeout
│       │   ├── logger.js         # Pino (logs estructurados)
│       │   └── prisma.js         # Singleton PrismaClient
│       └── socket/
│           └── broadcaster.js    # Emisor de eventos Socket.io
│
├── frontend/                     # SPA Vanilla JS con Vite
│   ├── index.html                # Punto de entrada HTML
│   ├── package.json
│   ├── vite.config.js            # Proxy a backend + build config
│   └── src/
│       ├── main.js               # Entry point de Vite
│       ├── app.js                # Logica principal SPA + Socket.io
│       ├── api.js                # Cliente REST del backend
│       ├── charts.js             # Chart.js (historial + sparklines)
│       ├── map.js                # Leaflet (mapa mundial interactivo)
│       ├── simulator.js          # Simulador de posiciones virtuales
│       └── style.css             # Estilos dark terminal / fintech
│
├── spaces/                       # HuggingFace Spaces (ZeroGPU)
│   ├── modernfinbert/            # Space de ModernFinBERT
│   │   ├── app.py
│   │   ├── requirements.txt
│   │   └── README.md
│   └── qwen3-8b/                 # Space de Qwen3-8B
│       ├── app.py
│       ├── Dockerfile
│       ├── requirements.txt
│       └── README.md
│
├── package.json                  # Root con workspaces + scripts conjuntos
├── docker-compose.yml            # Orquestacion local
├── Dockerfile                    # Build para HuggingFace Spaces
├── .env.example                  # Variables de entorno de ejemplo
├── SECURITY_HEALTHCHECK.md       # Auditoria de seguridad y arquitectura
└── README.md
```

## Requisitos

- **Node.js >= 26.0.0**
- **npm >= 10** (workspaces)

## Instalacion rapida

```bash
# 1. Instalar dependencias (root + todos los workspaces)
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus claves (HF_TOKEN, HF_SPACE_*, OPENROUTER_API_KEY, etc.)

# 3. Generar base de datos y cliente Prisma
npm run db:migrate
npm run db:generate

# 4. Iniciar en desarrollo
npm run dev:all      # Backend + Frontend Vite simultaneamente
```

## Desarrollo solo frontend

Si solo quieres visualizar el dashboard (funciona con datos mock):

```bash
cd frontend
npm install
npm run dev
# Abrir http://localhost:5173
```

El frontend consume datos mock localmente cuando el backend no responde, por lo que el dashboard es totalmente funcional para la demo sin configuracion adicional.

## Arquitectura del Backend

El backend sigue una arquitectura **Layered (Controller → Service → Repository)**:

| Capa | Responsabilidad | Ejemplo |
|------|----------------|---------|
| **Controller** | Recibir HTTP request, delegar a Service, responder | `markets.controller.js` |
| **Service** | Logica de negocio, validaciones, coordinacion | `markets.service.js` |
| **Repository** | Acceso a datos via Prisma ORM | `markets.repository.js` |
| **Client** | Integracion con APIs externas | `polymarket.client.js`, `finnhub.client.js` |
| **Middleware** | Cross-cutting concerns (auth, validacion, rate limiting) | `requireAuth.js`, `validate.js` |

### Pipeline de IA

```
Whitelist analyzable (skip predicciones-de-palabras, sports, memes)
    ↓
Noticias (Finnhub) → relevantes por mercado
    ↓
Filtrado (ModernFinBERT Space / API directa)
    ↓ (descarta neutrales, score < 0.65)
Ground truth crypto (CoinGecko spot → solo si aplica)
    ↓
Generacion de senal (Qwen3-8B Space / API directa)
    ↓
Fallback: OpenRouter (deepseek-chat)
    ↓
Fallback: Rule-based (precio del mercado)
    ↓
Calculo edge: impliedProb vs fairProb → edgePoints
    ↓
Persistencia (SQLite) + Emision Socket.io
```

### Scheduler (node-cron)

| Job | Frecuencia | Descripcion |
|-----|-----------|-------------|
| syncMarkets | Cada 30s | Sincroniza precios + spread desde Polymarket Gamma (fetch diversificado por tag) |
| generateSignals | Cada 5 min | Genera senales IA para 40 mercados diversificados por categoria (solo analyzable=true) |
| updatePositionsPnL | Cada 30s | Recalcula P&L de posiciones abiertas |
| processAlerts | Cada 60s | Revisa watchlist y envia alertas Telegram |

## Arquitectura del Frontend

El frontend es una SPA construida con **Vite 7** como bundler y dev server.

### Caracteristicas visuales

- **Estetica dark terminal / fintech:** paleta `#0a0c10`, tipografias `Syne` + `DM Mono`.
- **Layout ajustable:** sidebar colapsable, paneles del dashboard colapsables individualmente.
- **Mapa global interactivo:** Leaflet con burbujas por pais (tamano = volumen, color = senal IA), jitter determinista para evitar apilamientos y 40 hubs financieros para mercados sin pais.
- **Panel de senales IA:** mercados con badges alcista/bajista/neutral, **fila de edge cuantitativa** (`Mercado X% · IA Y% · Edge ±N pp`) y badge **"FUERA DE ALCANCE"** para mercados no analizables.
- **Detalle de mercado:** sparklines, historial 7d, analisis IA, simulador de posiciones con **sugerencia de tamano Quarter-Kelly cost-aware** (servida por `GET /positions/suggestion/:marketId`) y deshabilitacion automatica para mercados con spread > 5¢.
- **Vistas adicionales:** Posiciones abiertas, Lista de seguimiento, Historial de alertas.

### Flujo de desarrollo

| Servicio | Comando | URL local |
|----------|---------|-----------|
| Backend (Express + Socket.io) | `npm run dev` | `http://localhost:7860` |
| Frontend (Vite + HMR) | `npm run dev:frontend` | `http://localhost:5173` |
| **Ambos a la vez** | **`npm run dev:all`** | — |

Vite esta configurado con un proxy que redirige automaticamente las peticiones a `/api` y `/socket.io` hacia el backend en el puerto `7860`, eliminando problemas de CORS durante el desarrollo local.

### Scripts disponibles

```bash
# Levantar solo el backend
npm run dev

# Levantar solo el frontend (Vite con hot reload)
npm run dev:frontend

# Levantar backend y frontend simultaneamente
npm run dev:all

# Build de produccion del frontend (genera frontend/dist/)
npm run build:frontend

# Preview del build de produccion
npm run preview:frontend

# Base de datos
npm run db:migrate      # Crear/actualizar migraciones
npm run db:generate     # Generar cliente Prisma
npm run db:studio       # Explorar BD con Prisma Studio
```

## Deploy en HuggingFace Spaces

1. Crear Space tipo "Docker"
2. Subir codigo (`git push`)
3. Configurar Secrets en la interfaz de HF con las variables de `.env`
4. El contenedor expone el puerto 7860 automaticamente

### Docker local (opcional)

```bash
# Build y run con docker-compose
docker-compose up --build

# O solo docker build
docker build -t polysignal .
docker run -p 7860:7860 --env-file .env polysignal
```

## Variables de entorno

```env
# HuggingFace
HF_TOKEN=                          # API key de HuggingFace (Inference API)
HF_SPACE_MODERNFINBERT_URL=        # URL del Space (ej: usuario/modernfinbert)
HF_SPACE_QWEN_URL=                 # URL del Space (ej: usuario/qwen3-8b)

# Fallbacks y datos
OPENROUTER_API_KEY=                # Fallback LLM si HF esta saturado
FINNHUB_API_KEY=                   # Noticias financieras (finnhub.io)

# Alertas
TELEGRAM_BOT_TOKEN=                # Bot de alertas (@BotFather)

# Base de datos y auth
DATABASE_URL=file:./backend/prisma/polysignal.db
JWT_SECRET=minimo-32-caracteres    # Secreto para firmar JWT

# Servidor
PORT=7860                          # Puerto requerido por HuggingFace Spaces
NODE_ENV=production                # development | production
```

## Equipo

Hackathon CIFO Barcelona La Violeta — 13-18 mayo 2026

## Licencia

MIT
