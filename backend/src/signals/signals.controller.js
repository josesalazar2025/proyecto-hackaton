/**
 * Controladores del modulo de senales IA.
 *
 * Responsabilidades:
 *   - getLatest(req, res) → devuelve la senal mas reciente de un mercado.
 *
 * Endpoint:
 *   GET /api/v1/markets/:marketId/signal
 *
 * Errores:
 *   - 404 NOT_FOUND si el mercado no existe.
 *   - 404 NOT_FOUND si aun no hay senal generada para ese mercado.
 */

import { ok } from '../utils/apiResponse.js';
import { signalsService } from './signals.service.js';

export const signalsController = {
  async getLatest(req, res) {
    const signal = await signalsService.getLatest(req.params.marketId);
    ok(res, signal);
  },

  async getLatestBatch(req, res) {
    const ids = req.query.marketIds;
    const marketIds = ids ? ids.split(',').filter(Boolean) : [];
    const signals = await signalsService.getLatestBatch(marketIds);
    ok(res, signals);
  },
};
