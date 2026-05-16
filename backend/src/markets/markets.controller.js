/**
 * Controladores del modulo de mercados.
 *
 * Responsabilidades:
 *   - list(req, res)   → listado paginado y filtrado de mercados activos.
 *   - getById(req, res) → detalle de un mercado por su ID nativo de Polymarket.
 *
 * Datos expuestos:
 *   - id, question, category, countryCode, yesPrice, noPrice,
 *     volumeEur, liquidityEur, status, closesAt, lastSynced.
 *
 * Errores:
 *   - 404 NOT_FOUND si el mercado no existe.
 */

import { ok } from '../utils/apiResponse.js';
import { marketsService } from './markets.service.js';

export const marketsController = {
  async list(req, res) {
    const { limit, offset, category, status } = req.query;
    const { data, total } = await marketsService.list({ limit, offset, category, status });
    ok(res, data, { total, limit, offset });
  },

  async getById(req, res) {
    const market = await marketsService.getById(req.params.id);
    ok(res, market);
  },
};
