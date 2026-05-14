/**
 * Cliente HTTP para consumir la API REST del backend.
 *
 * Funciones fetch encapsuladas para cada endpoint:
 *   - getMarkets(), getMarket(id), getSignal(id)
 *   - createPosition(data), getPositions(), closePosition(id)
 *   - addToWatchlist(marketId), removeFromWatchlist(marketId), getWatchlist()
 *   - getAlerts(), getStats()
 *
 * Base URL: /api/v1 (mismo dominio, sin CORS en producción HF Spaces).
 */
