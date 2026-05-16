# POSITIONS.md — Módulo de posiciones

Simulador de capital virtual. Las posiciones no generan órdenes reales en Polymarket — son un tracking local de apuestas simuladas en euros.

**Todos los endpoints requieren `Authorization: Bearer <token>`.**

---

## Endpoints

### `POST /api/v1/positions`

Abre una posición nueva en un mercado activo.

**Body**

```json
{
  "marketId": "559677",
  "outcome": "YES",
  "amountEur": 100
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `marketId` | string | ID del mercado (debe existir y estar `active`) |
| `outcome` | `"YES"` \| `"NO"` | Lado de la apuesta |
| `amountEur` | float > 0 | Importe a invertir en euros |

**Respuesta `201`**

```json
{
  "ok": true,
  "data": {
    "id": 1,
    "userId": 1,
    "marketId": "559677",
    "outcome": "YES",
    "amountEur": 100,
    "entryPrice": 0.0075,
    "currentPrice": 0.0075,
    "pnl": 0,
    "kellyFraction": 0.25,
    "status": "open",
    "openedAt": "2026-05-16T09:14:55.750Z",
    "closedAt": null,
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

**Campos de respuesta relevantes**

| Campo | Descripción |
|---|---|
| `entryPrice` | Precio en el momento de abrir (`yesPrice` o `noPrice` según `outcome`) |
| `currentPrice` | Precio actual (actualizado por `updatePositionsPnL` cada 30s) |
| `pnl` | Profit & Loss en EUR (negativo = pérdida) |
| `kellyFraction` | Fracción de Kelly calculada (capada al 0.25) |
| `status` | `"open"` \| `"closed"` |

---

### `GET /api/v1/positions`

Lista todas las posiciones del usuario autenticado (abiertas y cerradas).

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
      "id": 1,
      "userId": 1,
      "marketId": "559677",
      "outcome": "YES",
      "amountEur": 100,
      "entryPrice": 0.0075,
      "currentPrice": 0.0075,
      "pnl": 0,
      "kellyFraction": 0.25,
      "status": "closed",
      "openedAt": "2026-05-16T09:14:55.750Z",
      "closedAt": "2026-05-16T09:15:04.155Z",
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

### `DELETE /api/v1/positions/:id`

Cierra una posición abierta. Calcula el P&L final con el precio actual.

**Params**

| Param | Tipo | Descripción |
|---|---|---|
| `id` | int | ID de la posición |

**Respuesta `200`**

```json
{
  "ok": true,
  "data": {
    "id": 1,
    "status": "closed",
    "closedAt": "2026-05-16T09:15:04.155Z",
    "pnl": -99.25
  }
}
```

**Errores**

| HTTP | Código | Cuándo |
|---|---|---|
| `404` | `NOT_FOUND` | Posición no existe o no pertenece al usuario |
| `409` | `CONFLICT` | La posición ya está cerrada |

---

## Criterio de Kelly

`kellyFraction = (pWin - pLoss) / pWin` capado al 25% y nunca negativo.

- `pWin` = precio del outcome elegido (`yesPrice` o `noPrice`)
- `pLoss` = `1 - pWin`

El resultado es informativo — el usuario decide cuánto invertir.

---

## Socket — actualización de P&L

El job `updatePositionsPnL` recalcula `currentPrice` y `pnl` de todas las posiciones abiertas cada 30s. No emite evento de socket propio; el frontend puede re-fetch `GET /positions` tras recibir `market_update`.

---

## Ejemplos `curl`

```bash
TOKEN=$(curl -s -X POST http://localhost:7860/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@polysignal.test","password":"Admin123!"}' | jq -r '.data.token')

# Abrir posición
curl -s -X POST http://localhost:7860/api/v1/positions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"marketId":"559677","outcome":"YES","amountEur":50}' | jq

# Listar posiciones
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:7860/api/v1/positions | jq

# Cerrar posición (id=1)
curl -s -X DELETE -H "Authorization: Bearer $TOKEN" http://localhost:7860/api/v1/positions/1 | jq
```

---

## Códigos de error

| HTTP | Código | Cuándo |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Body inválido (outcome no es YES/NO, amountEur <= 0) |
| `401` | `UNAUTHORIZED` | Sin token o token inválido |
| `404` | `NOT_FOUND` | Mercado o posición no existe |
| `409` | `CONFLICT` | Mercado no activo o posición ya cerrada |
| `500` | `INTERNAL` | Error inesperado |
