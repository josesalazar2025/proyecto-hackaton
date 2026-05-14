/**
 * Scheduler de tareas periódicas usando node-cron.
 *
 * Define y ejecuta los 4 jobs principales:
 * 1. syncMarkets       — cada 30s, sincroniza precios desde Polymarket Gamma API.
 * 2. generateSignals   — cada 5 min, genera señales IA para el top 20 mercados.
 * 3. updatePositionsPnL— cada 30s, recalcula P&L de posiciones abiertas.
 * 4. processAlerts     — cada 60s, revisa watchlist y envía alertas Telegram.
 */
