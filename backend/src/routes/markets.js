/**
 * Rutas REST para mercados de predicción.
 *
 * Endpoints:
 *   GET /api/v1/markets          — lista mercados activos (filtrables por category, country, limit)
 *   GET /api/v1/markets/:id      — detalle de un mercado + última señal IA
 *
 * Delega la obtención de datos al servicio services/polymarket.js.
 */
