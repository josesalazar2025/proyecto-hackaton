/**
 * Broadcaster de eventos en tiempo real via Socket.io.
 *
 * Actua como un wrapper singleton sobre la instancia de Socket.io.
 * Responsabilidades:
 *   - Recibir la instancia de io en el arranque (attachBroadcaster).
 *   - Emitir eventos tipados a todos los clientes conectados:
 *       * market_update  → cambio de precio/volumen de un mercado.
 *       * ai_signal      → nueva senal generada por el pipeline de IA.
 *       * price_alert    → alerta de umbral de precio o cambio de senal.
 *
 * Los controladores y servicios importan estas funciones para notificar
 * sin acoplarse directamente a Socket.io.
 */

let _io = null;

export function attachBroadcaster(io) {
  _io = io;
}

export function emitMarketUpdate(payload) {
  _io?.emit('market_update', payload);
}

export function emitAiSignal(payload) {
  _io?.emit('ai_signal', payload);
}

export function emitPriceAlert(payload) {
  _io?.emit('price_alert', payload);
}
