/**
 * Logica de negocio del modulo de mercados.
 *
 * Responsabilidades:
 *   - list(query)   → delega a marketsRepository.findMany + count para paginacion.
 *   - getById(id)   → busca un mercado; si no existe lanza 404.
 *
 * Consumido por:
 *   - markets.controller.js (API REST).
 *   - scheduler.js (syncMarkets cada 30s).
 *
 * No contiene logica de scraping directa; delega a polymarket.client.js
 * y persiste via marketsRepository.
 */

import { HttpError } from '../utils/apiResponse.js';
import { marketsRepository } from './markets.repository.js';

export const marketsService = {
  async list(query) {
    const [data, total] = await Promise.all([
      marketsRepository.findMany(query),
      marketsRepository.count(query),
    ]);
    return { data, total };
  },

  async getById(id) {
    const market = await marketsRepository.findById(id);
    if (!market) throw new HttpError(404, 'NOT_FOUND', 'Market not found');
    return market;
  },
};
