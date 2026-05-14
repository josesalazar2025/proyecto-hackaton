/**
 * Módulo de difusión de eventos en tiempo real vía Socket.io.
 *
 * Emite desde el servidor hacia todos los clientes conectados:
 *   - 'market_update' → precios actualizados de mercados (cada 30s)
 *   - 'ai_signal'     → nueva señal IA generada (cada 5 min)
 *   - 'price_alert'   → alerta de umbral activada (cada 60s)
 *
 * Se importa y usa en index.js (servidor) y en scheduler.js (jobs).
 */
