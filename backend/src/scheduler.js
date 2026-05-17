/**
 * Scheduler de tareas periodicas usando node-cron.
 *
 * Define y ejecuta los 4 jobs principales del backend:
 *   1. syncMarkets        — cada 30s, sincroniza precios desde Polymarket Gamma API.
 *   2. generateSignals    — cada 5 min, genera senales IA para el top 20 mercados activos.
 *   3. updatePositionsPnL — cada 30s, recalcula P&L de posiciones abiertas.
 *   4. processAlerts      — cada 60s, revisa watchlist y envia alertas por Telegram.
 *
 * Cada job captura sus propios errores para evitar que un fallo afecte a los demas.
 * Se ejecuta inmediatamente al arrancar (llamada manual) y luego segun cron.
 */

import { schedule } from 'node-cron';
import { fetchActiveMarkets } from './markets/polymarket.client.js';
import { marketsRepository } from './markets/markets.repository.js';
import { signalsService } from './signals/signals.service.js';
import { positionsService } from './positions/positions.service.js';
import { alertsService } from './alerts/alerts.service.js';
import { emitMarketUpdate } from './socket/broadcaster.js';
import { logger } from './utils/logger.js';

async function syncMarkets() {
  try {
    const markets = await fetchActiveMarkets();
    await Promise.all(markets.map((m) => marketsRepository.upsert(m)));
    // Purga mercados activos que no aparecieron en este sync (restos de syncs previos)
    const deactivated = await marketsRepository.deactivateStale(markets.map((m) => m.id));
    for (const m of markets) {
      emitMarketUpdate({ marketId: m.id, yesPrice: m.yesPrice, noPrice: m.noPrice, volumeEur: m.volumeEur });
    }
    logger.info({ count: markets.length, deactivated }, 'markets synced');
  } catch (err) {
    logger.error({ err: err.message }, 'syncMarkets failed');
  }
}

async function generateSignals() {
  try {
    // Seleccion diversificada por categoria + liquidez (40 mercados/ciclo)
    const markets = await marketsRepository.findDiversified(40);
    const byCategory = markets.reduce((acc, m) => {
      acc[m.category] = (acc[m.category] || 0) + 1;
      return acc;
    }, {});
    logger.info({ total: markets.length, byCategory }, 'generating signals for diversified set');

    for (const market of markets) {
      try {
        await signalsService.generateForMarket(market);
      } catch (err) {
        logger.error({ err: err.message, marketId: market.id }, 'signal generation failed for market');
      }
    }
  } catch (err) {
    logger.error({ err: err.message }, 'generateSignals failed');
  }
}

async function updatePositionsPnL() {
  try {
    await positionsService.updateAllPnL();
  } catch (err) {
    logger.error({ err: err.message }, 'updatePositionsPnL failed');
  }
}

async function processAlerts() {
  try {
    await alertsService.processAll();
  } catch (err) {
    logger.error({ err: err.message }, 'processAlerts failed');
  }
}

export function startScheduler() {
  syncMarkets();
  schedule('*/30 * * * * *', syncMarkets);
  schedule('*/5 * * * *', generateSignals);
  schedule('*/30 * * * * *', updatePositionsPnL);
  schedule('* * * * *', processAlerts);
  logger.info('scheduler started');
}
