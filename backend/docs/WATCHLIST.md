# WATCHLIST.md — Módulo de watchlist

Mercados favoritos del usuario con umbral de alerta opcional. Cuando `yesPrice >= alertThreshold`, el job `processAlerts` crea una `Alert` y envía notificación por Telegram.

**Todos los endpoints requieren `Authorization: Bearer <token>`.**

---

## Endpoints

### `POST /api/v1/watchlist`

Añade un mercado a la watchlist del usuario.

**Body**

```json
{
  "marketId": "559677",
  "alertThreshold": 0.75
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `marketId` | string | ID del mercado (debe existir en DB) |
| `alertThreshold` | float (0–1) \| null | Precio YES que dispara la alerta; `null` para no alertar |

**Respuesta `201`**

```json
{
  "ok": true,
  "data": {
    "id": 2,
    "userId": 1,
    "marketId": "559677",
    "alertThreshold": 0.75,
    "createdAt": "2026-05-16T09:21:41.606Z",
    "market": {
      "id": "559677",
      "question": "Will Hillary Clinton win the 2028 Democratic presidential nomination?",
      "yesPrice": 0.0075,
      "noPrice": 0.9925,
      "status": "active"
    }
  }
}
```

**Respuesta `409`** — mercado ya está en la watchlist del usuario:

```json
{
  "ok": false,
  "error": { "code": "CONFLICT", "message": "Market already in watchlist" }
}
```

---

### `GET /api/v1/watchlist`

Lista todos los mercados en la watchlist del usuario con datos de mercado embebidos.

**Respuesta `200`**

```json
{
  "ok": true,
  "data": [
    {
      "id": 2,
      "userId": 1,
      "marketId": "559677",
      "alertThreshold": 0.001,
      "createdAt": "2026-05-16T09:21:41.606Z",
      "market": {
        "id": "559677",
        "question": "Will Hillary Clinton win the 2028 Democratic presidential nomination?",
        "yesPrice": 0.0075,
        "noPrice": 0.9925,
        "status": "active"
      }
    }
  ]
}
```

---

### `DELETE /api/v1/watchlist/:marketId`

Elimina un mercado de la watchlist del usuario.

**Params**

| Param | Tipo | Descripción |
|---|---|---|
| `marketId` | string | ID del mercado |

**Respuesta `204`** — sin body.

**Respuesta `404`**

```json
{
  "ok": false,
  "error": { "code": "NOT_FOUND", "message": "Watchlist entry not found" }
}
```

---

## Lógica de alertas

El job `processAlerts` (cron `* * * * *`) evalúa cada entrada de watchlist con `alertThreshold` definido:

- Si `market.yesPrice >= alertThreshold` → crea `Alert` + envía Telegram + emite `price_alert` por socket.
- Deduplicación: no se crea una segunda alerta si ya existe una para el mismo mercado en los últimos 5 min.

Para recibir alertas por Telegram, el usuario debe tener `telegramChatId` configurado en su perfil (campo opcional en `User`).

---

## Ejemplos `curl`

```bash
TOKEN=$(curl -s -X POST http://localhost:7860/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@polysignal.test","password":"Admin123!"}' | jq -r '.data.token')

# Añadir a watchlist con umbral 75%
curl -s -X POST http://localhost:7860/api/v1/watchlist \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"marketId":"559677","alertThreshold":0.75}' | jq

# Listar watchlist
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:7860/api/v1/watchlist | jq

# Eliminar de watchlist
curl -s -X DELETE -H "Authorization: Bearer $TOKEN" \
  "http://localhost:7860/api/v1/watchlist/559677"
```

---

## Códigos de error

| HTTP | Código | Cuándo |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Body inválido (marketId vacío, threshold fuera de 0–1) |
| `401` | `UNAUTHORIZED` | Sin token o token inválido |
| `404` | `NOT_FOUND` | Mercado no existe en DB o entrada no encontrada al borrar |
| `409` | `CONFLICT` | Mercado ya en watchlist |
| `500` | `INTERNAL` | Error inesperado |
