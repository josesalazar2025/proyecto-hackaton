# ALERTS.md — Módulo de alertas

Historial de alertas de precio disparadas por el job `processAlerts`. Las alertas se crean automáticamente cuando `yesPrice >= alertThreshold` en la watchlist del usuario.

**Todos los endpoints requieren `Authorization: Bearer <token>`.**

---

## Endpoints

### `GET /api/v1/alerts`

Lista el historial de alertas del usuario, paginado y ordenado por `sentAt` DESC.

**Query params**

| Param | Tipo | Default | Descripción |
|---|---|---|---|
| `limit` | int (1-100) | `20` | Máximo de resultados |
| `offset` | int | `0` | Paginación por offset |

**Respuesta `200`**

```json
{
  "ok": true,
  "data": [
    {
      "id": 4,
      "userId": 1,
      "marketId": "559677",
      "type": "price_threshold",
      "message": "<b>Price Alert</b>\nWill Hillary Clinton win the 2028 Democratic presidential nomination?\nYES: 0.8% ≥ threshold 0.1%",
      "sentAt": "2026-05-16T09:38:00.033Z",
      "market": {
        "id": "559677",
        "question": "Will Hillary Clinton win the 2028 Democratic presidential nomination?"
      }
    }
  ]
}
```

**Campos**

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int | ID de la alerta |
| `userId` | int | Usuario que la recibió |
| `marketId` | string | Mercado que la disparó |
| `type` | string | Tipo de alerta (`price_threshold`) |
| `message` | string | Mensaje enviado (formato HTML para Telegram) |
| `sentAt` | ISO 8601 | Timestamp de envío |
| `market.question` | string | Pregunta del mercado (para mostrar en UI) |

---

## Flujo de creación

Las alertas **no se crean desde el frontend** — solo se leen. El flujo de creación es:

1. `POST /api/v1/watchlist` con `alertThreshold` → guarda umbral en DB.
2. Job `processAlerts` (cada minuto): evalúa `yesPrice >= alertThreshold` para cada watchlist entry con threshold definido.
3. Si se cumple y no hay alerta reciente (< 5 min): crea `Alert` + envía Telegram + emite `price_alert` por socket.

---

## Socket — evento `price_alert`

**Nombre del evento:** `price_alert`

**Payload**

```json
{
  "marketId": "559677",
  "type": "price_threshold",
  "message": "<b>Price Alert</b>\n..."
}
```

**Uso en el frontend**

```js
socket.on('price_alert', ({ marketId, message }) => {
  // mostrar notificación toast
});
```

---

## Integración Telegram

Para recibir alertas vía Telegram:

1. Crear un bot en [@BotFather](https://t.me/BotFather) y obtener el `TELEGRAM_BOT_TOKEN`.
2. El usuario debe iniciar conversación con el bot y obtener su `chatId`.
3. Configurar `telegramChatId` en el registro `User` (actualmente solo vía `prisma studio` o seed).
4. Añadir `TELEGRAM_BOT_TOKEN` al `.env`.

Si `TELEGRAM_BOT_TOKEN` no está configurado o el usuario no tiene `telegramChatId`, el envío se omite silenciosamente (la `Alert` se crea igualmente en DB).

---

## Ejemplos `curl`

```bash
TOKEN=$(curl -s -X POST http://localhost:7860/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@polysignal.test","password":"Admin123!"}' | jq -r '.data.token')

# Listar alertas (últimas 10)
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:7860/api/v1/alerts?limit=10" | jq

# Segunda página
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:7860/api/v1/alerts?limit=10&offset=10" | jq
```

---

## Códigos de error

| HTTP | Código | Cuándo |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Params inválidos (limit > 100) |
| `401` | `UNAUTHORIZED` | Sin token o token inválido |
| `500` | `INTERNAL` | Error inesperado |
