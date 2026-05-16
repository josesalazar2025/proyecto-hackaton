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
    const markets = await fetchActiveMarkets(100);
    await Promise.all(markets.map((m) => marketsRepository.upsert(m)));
    for (const m of markets) {
      emitMarketUpdate({ marketId: m.id, yesPrice: m.yesPrice, noPrice: m.noPrice, volumeEur: m.volumeEur });
    }
    logger.info({ count: markets.length }, 'markets synced');
  } catch (err) {
    logger.error({ err: err.message }, 'syncMarkets failed');
  }
}

async function generateSignals() {
  try {
    const markets = await marketsRepository.findMany({ limit: 20, offset: 0, status: 'active' });
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
