# MARKETS.md — Módulo de mercados

Referencia para el frontend: contrato HTTP, mapping de datos de Polymarket, evento socket y errores.

---

## Variables de entorno requeridas

```
DATABASE_URL=file:./backend/prisma/polysignal.db
PORT=7860
```

No se necesita clave de API para Polymarket Gamma (pública).

---

## Endpoints

### `GET /api/v1/markets`

Lista paginada de mercados activos sincronizados desde Polymarket. **No requiere autenticación.**

**Query params**

| Param | Tipo | Default | Descripción |
|---|---|---|---|
| `limit` | int (1-100) | `20` | Máximo de resultados |
| `offset` | int | `0` | Paginación por offset |
| `category` | string | — | Filtro: `politics` \| `crypto` \| `economics` \| `sports` |
| `status` | string | `active` | Filtro: `active` \| `closed` \| `resolved` |

**Respuesta `200`**

```json
{
  "ok": true,
  "data": [
    {
      "id": "559677",
      "question": "Will Hillary Clinton win the 2028 Democratic presidential nomination?",
      "category": null,
      "countryCode": null,
      "yesPrice": 0.0075,
      "noPrice": 0.9925,
      "volumeEur": 38608906.44,
      "liquidityEur": 2301398.64,
      "status": "active",
      "closesAt": "2028-11-07T00:00:00.000Z",
      "lastSynced": "2026-05-16T09:38:30.204Z"
    }
  ],
  "meta": {
    "total": 100,
    "limit": 1,
    "offset": 0
  }
}
```

> `category` y `countryCode` pueden ser `null` si Polymarket no los proporciona.

---

### `GET /api/v1/markets/:id`

Detalle de un mercado por su ID de Polymarket. **No requiere autenticación.**

**Params**

| Param | Tipo | Descripción |
|---|---|---|
| `id` | string | ID numérico de Polymarket (ej. `559677`) |

**Respuesta `200`**

```json
{
  "ok": true,
  "data": {
    "id": "559677",
    "question": "Will Hillary Clinton win the 2028 Democratic presidential nomination?",
    "category": null,
    "countryCode": null,
    "yesPrice": 0.0075,
    "noPrice": 0.9925,
    "volumeEur": 38608906.44,
    "liquidityEur": 2301398.64,
    "status": "active",
    "closesAt": "2028-11-07T00:00:00.000Z",
    "lastSynced": "2026-05-16T09:38:30.204Z"
  }
}
```

**Respuesta `404`**

```json
{
  "ok": false,
  "error": { "code": "NOT_FOUND", "message": "Market not found" }
}
```

---

### `GET /api/v1/markets/:id/signal`

Señal AI más reciente para un mercado. Ver [SIGNALS.md](SIGNALS.md) para el contrato completo.

---

## Mapping Polymarket Gamma API → `Market`

URL de origen: `https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=100`

| Campo Gamma API | Campo `Market` | Transformación |
|---|---|---|
| `id` | `id` | String (ID numérico de Polymarket) |
| `question` | `question` | Directo |
| `category` | `category` | Minúsculas; `null` si Gamma no lo envía |
| — | `countryCode` | `null` por defecto (no proporcionado por Gamma) |
| `outcomePrices[0]` | `yesPrice` | `parseFloat`; rango 0.0–1.0 |
| `outcomePrices[1]` | `noPrice` | `parseFloat`; rango 0.0–1.0 |
| `volume` | `volumeEur` | `parseFloat(volume) * 0.93` (USD→EUR tasa fija) |
| `liquidity` | `liquidityEur` | Igual que `volumeEur` |
| `active` + `closed` + `archived` | `status` | `active=true → "active"`, `closed=true → "closed"`, `archived=true → "resolved"` |
| `endDateIso` | `closesAt` | `new Date(endDateIso)` |
| — | `lastSynced` | `new Date()` en el momento del upsert |

La sincronización usa `prisma.market.upsert({ where: { id }, ... })` para evitar duplicados.

---

## Socket — evento `market_update`

Emitido por `src/socket/broadcaster.js` cada 30 s (tras `syncMarkets`).

**Nombre del evento:** `market_update`

**Payload**

```json
{
  "marketId": "0x1a2b...",
  "yesPrice": 0.63,
  "noPrice": 0.37,
  "volumeEur": 125000.00
}
```

**Uso en el frontend (Socket.io client)**

```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:7860');
socket.on('market_update', ({ marketId, yesPrice, noPrice }) => {
  // actualizar estado local del mercado
});
```

En producción (HF Spaces) el frontend y backend comparten origen → usar `io()` sin URL.

---

## Ejemplos `curl`

```bash
# Listar mercados (primeros 5)
curl "http://localhost:7860/api/v1/markets?limit=5"

# Filtrar por estado
curl "http://localhost:7860/api/v1/markets?status=active&limit=10"

# Detalle de un mercado
curl "http://localhost:7860/api/v1/markets/559677"

# Señal AI del mercado
curl "http://localhost:7860/api/v1/markets/559677/signal"
```

---

## Códigos de error relevantes

| HTTP | Código | Cuándo |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Parámetro inválido (ej. `limit` > 100) |
| `404` | `NOT_FOUND` | ID de mercado no existe en DB |
| `500` | `INTERNAL` | Error inesperado del servidor |

Los endpoints de markets **no requieren autenticación** — son datos públicos.
