/**
 * Servicio de envío de alertas por Telegram Bot API.
 *
 * Implementación sin librerías externas: llamada HTTP directa a:
 *   POST https://api.telegram.org/bot<TOKEN>/sendMessage
 *
 * Tipos de alerta soportados:
 *   - price_threshold: un precio de watchlist cruzó el umbral definido.
 *   - signal_change: la señal IA de un mercado cambió de estado.
 *
 * El chat_id se obtiene del campo telegramChatId del usuario demo.
 */
