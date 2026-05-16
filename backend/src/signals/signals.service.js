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

  async generateForMarket(market) {
    const modelVersion = 'Qwen3-8B';
    const result = await aiPipeline.run(market);
    const saved = await signalsRepository.create({ marketId: market.id, modelVersion, ...result });
    emitAiSignal({ marketId: market.id, signal: saved.signal, confidence: saved.confidence, summary: saved.summary });
    logger.info({ marketId: market.id, signal: saved.signal }, 'signal generated');
    return saved;
  },
};
