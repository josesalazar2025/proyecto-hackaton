# SIGNALS.md — Módulo de señales AI

Referencia para el frontend: señales generadas por la pipeline FinBERT + Qwen3-8B sobre mercados de Polymarket.

---

## Variables de entorno (opcionales)

| Variable | Descripción |
|---|---|
| `HF_TOKEN` | HuggingFace Pro token — FinBERT + Qwen3-8B |
| `OPENROUTER_API_KEY` | Fallback LLM si HuggingFace está saturado |
| `FINNHUB_API_KEY` | Noticias financieras para contexto |

Sin ninguna clave, el backend usa una señal **rule-based** derivada de los precios del mercado.

---

## Endpoints

### `GET /api/v1/markets/:id/signal`

Señal AI más reciente para el mercado. **No requiere autenticación.**

**Params**

| Param | Tipo | Descripción |
|---|---|---|
| `id` | string | ID numérico de Polymarket (ej. `559677`) |

**Respuesta `200`**

```json
{
  "ok": true,
  "data": {
    "id": 81,
    "marketId": "559677",
    "signal": "bearish",
    "confidence": 0.9,
    "summary": "Market strongly favors NO at 99% probability. Downside momentum dominates.",
    "keyRisk": "Unexpected positive developments could reverse this rapidly.",
    "newsCount": 0,
    "modelVersion": "Qwen3-8B",
    "generatedAt": "2026-05-16T09:35:00.110Z"
  }
}
```

**Campos**

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | int | ID de la señal en DB |
| `marketId` | string | ID del mercado |
| `signal` | `"bullish"` \| `"bearish"` \| `"neutral"` | Dirección recomendada |
| `confidence` | float (0–1) | Nivel de confianza del modelo |
| `summary` | string | Resumen del análisis |
| `keyRisk` | string \| null | Principal riesgo identificado |
| `newsCount` | int | Noticias procesadas por Finnhub |
| `modelVersion` | string | Modelo que generó la señal (`Qwen3-8B`, `OpenRouter`, `rule-based`) |
| `generatedAt` | ISO 8601 | Timestamp de generación |

**Respuesta `404`**

```json
{
  "ok": false,
  "error": { "code": "NOT_FOUND", "message": "No signal found for this market" }
}
```

---

## Pipeline de generación

1. **Finnhub** → noticias relacionadas por keywords del `question`
2. **FinBERT** (HuggingFace) → filtro de sentimiento; descarta noticias irrelevantes
3. **Qwen3-8B** (HuggingFace) → genera señal JSON `{ signal, confidence, summary, keyRisk }`
4. **OpenRouter** → fallback si HF está saturado (HTTP 503)
5. **Rule-based** → fallback final: `yesPrice > 0.6 → bullish`, `yesPrice < 0.4 → bearish`, else `neutral`

La señal se persiste en `AISignal` y se emite por socket (`ai_signal`).

---

## Socket — evento `ai_signal`

Emitido por `src/socket/broadcaster.js` cada 5 min (tras `generateSignals`).

**Nombre del evento:** `ai_signal`

**Payload**

```json
{
  "marketId": "559677",
  "signal": "bearish",
  "confidence": 0.9,
  "summary": "Market strongly favors NO at 99% probability."
}
```

**Uso en el frontend**

```js
socket.on('ai_signal', ({ marketId, signal, confidence }) => {
  // actualizar badge de señal en la tarjeta del mercado
});
```

---

## Ejemplos `curl`

```bash
# Señal más reciente de un mercado
curl "http://localhost:7860/api/v1/markets/559677/signal"
```

---

## Códigos de error

| HTTP | Código | Cuándo |
|---|---|---|
| `404` | `NOT_FOUND` | No hay señal generada aún para ese mercado |
| `500` | `INTERNAL` | Error inesperado del servidor |
