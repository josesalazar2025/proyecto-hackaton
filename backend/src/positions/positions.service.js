/**
 * Logica de negocio del modulo de posiciones (simulador virtual).
 *
 * Responsabilidades:
 *   - open(userId, { marketId, outcome, amountEur })
 *     → valida que el mercado exista y este activo, obtiene precio de entrada,
 *       calcula fraccion de Kelly y crea la posicion.
 *   - list(userId, status) → devuelve posiciones del usuario.
 *   - close(id, userId)    → calcula P&L final con el precio actual y marca como cerrada.
 *   - updateAllPnL()       → recalcula P&L de todas las posiciones abiertas (scheduler).
 *
 * Calculos:
 *   - P&L = amountEur * (currentPrice / entryPrice - 1).
 *   - Kelly = (odds * pWin - pLose) / odds, capped al 25%.
 *
 * Consumido por:
 *   - positions.controller.js (API REST).
 *   - scheduler.js (updatePositionsPnL cada 30s).
 */

import { HttpError } from '../utils/apiResponse.js';
import { positionsRepository } from './positions.repository.js';
import { marketsRepository } from '../markets/markets.repository.js';
import { signalsRepository } from '../signals/signals.repository.js';
import { kellyFraction, suggestSize } from './kelly.js';

function currentPriceForOutcome(market, outcome) {
  return outcome === 'YES' ? market.yesPrice : market.noPrice;
}

function calcPnl(amountEur, entryPrice, currentPrice) {
  if (!currentPrice || !entryPrice) return 0;
  return amountEur * (currentPrice / entryPrice - 1);
}

export const positionsService = {
  async open(userId, { marketId, outcome, amountEur }) {
    const market = await marketsRepository.findById(marketId);
    if (!market) throw new HttpError(404, 'NOT_FOUND', 'Market not found');
    if (market.status !== 'active') throw new HttpError(409, 'MARKET_CLOSED', 'Market is not active');

    const entryPrice = currentPriceForOutcome(market, outcome);
    if (!entryPrice) throw new HttpError(409, 'NO_PRICE', 'Market price unavailable');

    const latestSignal = await signalsRepository.findLatestByMarket(marketId);
    const confidence = latestSignal?.confidence ?? 0.5;
    const fraction = kellyFraction(entryPrice, confidence);

    return positionsRepository.create({
      userId,
      marketId,
      outcome,
      amountEur,
      entryPrice,
      currentPrice: entryPrice,
      pnl: 0,
      kellyFraction: fraction,
      status: 'open',
    });
  },

  list(userId, status) {
    return positionsRepository.findByUser(userId, status);
  },

  async close(id, userId) {
    const position = await positionsRepository.findByIdAndUser(id, userId);
    if (!position) throw new HttpError(404, 'NOT_FOUND', 'Position not found');
    if (position.status === 'closed') throw new HttpError(409, 'ALREADY_CLOSED', 'Position already closed');

    const market = await marketsRepository.findById(position.marketId);
    const currentPrice = market ? currentPriceForOutcome(market, position.outcome) : position.entryPrice;
    const finalPnl = calcPnl(position.amountEur, position.entryPrice, currentPrice);

    return positionsRepository.update(id, {
      status: 'closed',
      currentPrice,
      pnl: finalPnl,
      closedAt: new Date(),
    });
  },

  /**
   * Sugiere outcome y tamano de posicion para un mercado, basado en:
   *   - Spread bid/ask (resta del edge)
   *   - Edge de la senal IA mas reciente (impliedProb vs fairProb)
   *   - Quarter-Kelly capado al 25% del bankroll
   *
   * Devuelve { outcome, fraction, amountEur, edgeNet, illiquid, note }.
   */
  async suggest(marketId, bankroll = 1000) {
    const market = await marketsRepository.findById(marketId);
    if (!market) throw new HttpError(404, 'NOT_FOUND', 'Market not found');

    const signal = await signalsRepository.findLatestByMarket(marketId);

    return suggestSize({
      yesPrice: market.yesPrice,
      noPrice: market.noPrice,
      spread: market.spread ?? 0,
      signal,
      bankroll,
    });
  },

  async updateAllPnL() {
    const open = await positionsRepository.findAllOpen();
    await Promise.all(
      open.map((pos) => {
        const currentPrice = currentPriceForOutcome(pos.market, pos.outcome);
        if (!currentPrice) return Promise.resolve();
        return positionsRepository.update(pos.id, {
          currentPrice,
          pnl: calcPnl(pos.amountEur, pos.entryPrice, currentPrice),
        });
      }),
    );
  },
};
