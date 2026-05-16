# API.md — Referencia general PolySignal Backend

Base URL (dev): `http://localhost:7860`  
Base URL (prod, HF Spaces): misma URL que el frontend (mismo origen).

---

## Arranque rápido

```bash
cd backend/
npm install
npm run db:migrate        # solo primera vez
npm run db:seed           # crea usuarios de prueba
npm run dev               # http://localhost:7860
```

Usuarios de prueba: `admin@polysignal.test / Admin123!` y `user@polysignal.test / User123!`

---

## Autenticación

El API usa JWT Bearer. Para obtener un token:

```bash
TOKEN=$(curl -s -X POST http://localhost:7860/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@polysignal.test","password":"Admin123!"}' | jq -r '.data.token')
```

Enviarlo en cada request protegido:

```
Authorization: Bearer <token>
```

---

## Endpoints

### Públicos (sin auth)

| Método | Ruta | Descripción | Doc |
|---|---|---|---|
| `GET` | `/api/v1/health` | Sanity check | [AUTH.md](AUTH.md) |
| `POST` | `/api/v1/auth/login` | Login → JWT | [AUTH.md](AUTH.md) |
| `GET` | `/api/v1/markets` | Lista mercados paginada | [MARKETS.md](MARKETS.md) |
| `GET` | `/api/v1/markets/:id` | Detalle de mercado | [MARKETS.md](MARKETS.md) |
| `GET` | `/api/v1/markets/:id/signal` | Señal AI del mercado | [SIGNALS.md](SIGNALS.md) |

### Protegidos (requieren `Authorization: Bearer <token>`)

| Método | Ruta | Descripción | Doc |
|---|---|---|---|
| `GET` | `/api/v1/auth/me` | Perfil del usuario | [AUTH.md](AUTH.md) |
| `POST` | `/api/v1/positions` | Abrir posición | [POSITIONS.md](POSITIONS.md) |
| `GET` | `/api/v1/positions` | Listar posiciones | [POSITIONS.md](POSITIONS.md) |
| `DELETE` | `/api/v1/positions/:id` | Cerrar posición | [POSITIONS.md](POSITIONS.md) |
| `POST` | `/api/v1/watchlist` | Añadir a watchlist | [WATCHLIST.md](WATCHLIST.md) |
| `GET` | `/api/v1/watchlist` | Listar watchlist | [WATCHLIST.md](WATCHLIST.md) |
| `DELETE` | `/api/v1/watchlist/:marketId` | Eliminar de watchlist | [WATCHLIST.md](WATCHLIST.md) |
| `GET` | `/api/v1/alerts` | Historial de alertas | [ALERTS.md](ALERTS.md) |

---

## Contrato de respuesta

Todas las respuestas siguen el mismo envelope:

```json
// éxito
{ "ok": true, "data": <payload>, "meta": { ...opcional } }

// error
{ "ok": false, "error": { "code": "ERROR_CODE", "message": "...", "details": [...] } }
```

Códigos HTTP: `200` lectura · `201` creación · `204` borrado · `400` validación · `401` no autenticado · `404` no encontrado · `409` conflicto · `429` rate limit · `500` server error.

---

## Rate limiting

- **Global:** 200 req / 15 min / IP
- **`POST /auth/login`:** 5 intentos / 15 min / IP

Headers de respuesta: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`.

---

## WebSocket (Socket.io)

Conectar al mismo host que el backend:

```js
import { io } from 'socket.io-client';
const socket = io('http://localhost:7860');
```

| Evento | Frecuencia | Descripción | Doc |
|---|---|---|---|
| `market_update` | cada 30s | Precio actualizado de un mercado | [MARKETS.md](MARKETS.md) |
| `ai_signal` | cada 5 min | Nueva señal AI generada | [SIGNALS.md](SIGNALS.md) |
| `price_alert` | cuando se dispara | Alerta de precio threshold | [ALERTS.md](ALERTS.md) |

---

## Importar en Insomnia / Postman

Ver [`insomnia-collection.json`](insomnia-collection.json) — export v4 listo para importar en Insomnia.

Pasos:
1. Abrir Insomnia → Import → File
2. Seleccionar `backend/docs/insomnia-collection.json`
3. Configurar variable de entorno `base_url = http://localhost:7860`
4. Ejecutar `POST /auth/login` y copiar el token a la variable `token`

---

## Variables de entorno completas

Ver [`backend/.env.example`](../.env.example) para la plantilla completa.

| Variable | Obligatoria | Descripción |
|---|---|---|
| `PORT` | Sí | Puerto del servidor (7860 para HF Spaces) |
| `DATABASE_URL` | Sí | Path SQLite: `file:./polysignal.db` |
| `JWT_SECRET` | Sí | Mínimo 32 chars |
| `JWT_EXPIRES_IN` | No | Default `1h` |
| `BCRYPT_ROUNDS` | No | Default `10` |
| `CORS_ORIGIN` | No | Default `http://localhost:5173` |
| `LOG_LEVEL` | No | Default `info` |
| `HF_TOKEN` | No | HuggingFace (señales AI reales) |
| `OPENROUTER_API_KEY` | No | Fallback LLM |
| `FINNHUB_API_KEY` | No | Noticias para señales |
| `TELEGRAM_BOT_TOKEN` | No | Alertas Telegram |
