/**
 * Rutas REST para alertas y notificaciones.
 *
 * Endpoints:
 *   GET /api/v1/alerts — historial de alertas enviadas (price_threshold, signal_change)
 *
 * Las alertas se generan automáticamente por el scheduler cada 60 segundos
 * y se envían vía Telegram Bot API.
 */
