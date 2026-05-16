/**
 * Logica de negocio del modulo de senales IA.
 *
 * Responsabilidades:
 *   - getLatest(marketId)      → devuelve la ultima senal persistida de un mercado.
 *   - generateForMarket(market) → ejecuta el pipeline de IA (aiPipeline.js) y persiste
 *     el resultado en AISignal. Emite evento 'ai_signal' por Socket.io.
 *
 * Flujo de generacion:
 *   1. aiPipeline.run(market) → obtiene { signal, confidence, summary, keyRisk, newsCount }.
 *   2. signalsRepository.create(...) → persiste en SQLite.
 *   3. emitAiSignal(...) → notifica a clientes conectados en tiempo real.
 *
 * Consumido por:
 *   - scheduler.js cada 5 minutos para los 20 mercados mas activos.
 *   - signals.controller.js para el endpoint GET /markets/:id/signal.
 */

import { HttpError } from '../utils/apiResponse.js';
import { signalsRepository } from './signals.repository.js';
import { marketsRepository } from '../markets/markets.repository.js';
import * as aiPipeline from './aiPipeline.js';
import { emitAiSignal } from '../socket/broadcaster.js';
import { logger } from '../utils/logger.js';

export const signalsService = {
  async getLatest(marketId) {
    const market = await marketsRepository.findById(marketId);
    if (!market) throw new HttpError(404, 'NOT_FOUND', 'Market not found');
    const signal = await signalsRepository.findLatestByMarket(marketId);
    if (!signal) throw new HttpError(404, 'NOT_FOUND', 'No signal available for this market yet');
    return signal;
  },

  async getLatestBatch(marketIds) {
    if (!marketIds || marketIds.length === 0) return [];
    const signals = await signalsRepository.findLatestForMarkets(marketIds);
    return signals;
  },

  async generateForMarket(market) {
    const modelVersion = 'Qwen3-8B';
    const result = await aiPipeline.run(market);
    const saved = await signalsRepository.create({ marketId: market.id, modelVersion, ...result });
    emitAiSignal({ marketId: market.id, signal: saved.signal, confidence: saved.confidence, summary: saved.summary });
    logger.info({ marketId: market.id, signal: saved.signal }, 'signal generated');
    return saved;
  },
};
