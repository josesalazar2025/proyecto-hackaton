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
import { httpGet } from '../utils/httpClient.js';

const CLOB_BASE = 'https://clob.polymarket.com';

export const marketsService = {
  async list(query) {
    // Si no hay filtro de categoria y es la primera pagina, devolvemos un mix
    // diversificado entre categorias (mejor UX que la pagina mono-categoria
    // que sale al ordenar por liquidez DESC).
    if (!query.category && query.offset === 0 && query.status === 'active') {
      const diversified = await marketsRepository.findDiversified(query.limit);
      const total = await marketsRepository.count(query);
      return { data: diversified, total };
    }
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

  async getPriceHistory(id, interval = '1w') {
    const market = await marketsRepository.findById(id);
    if (!market) throw new HttpError(404, 'NOT_FOUND', 'Market not found');
    if (!market.clobTokenId) throw new HttpError(404, 'NO_CLOB_TOKEN', 'Price history not available for this market');

    const fidelity = interval === '1d' ? 60 : 1440;
    const url = `${CLOB_BASE}/prices-history?market=${market.clobTokenId}&interval=${interval}&fidelity=${fidelity}`;
    const data = await httpGet(url);
    return data.history ?? [];
  },
};
