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
