/**
 * Rutas REST para señales de inteligencia artificial.
 *
 * Endpoints:
 *   GET /api/v1/markets/:id/signal — devuelve la señal IA más reciente del mercado.
 *
 * Las señales incluyen: signal (bullish|bearish|neutral), confidence (0-1),
 * summary, keyRisk y timestamp.
 */
