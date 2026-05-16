/**
 * Logica de negocio del modulo de lista de seguimiento (watchlist).
 *
 * Responsabilidades:
 *   - add(userId, { marketId, alertThreshold })
 *     → valida que el mercado exista, crea entrada en watchlist.
 *     → si ya existe (P2002), devuelve 409 ALREADY_IN_WATCHLIST.
 *   - remove(userId, marketId) → elimina entrada; si no existe devuelve 404.
 *   - list(userId)             → devuelve todas las entradas del usuario.
 *
 * Consumido por:
 *   - watchlist.controller.js (API REST).
 *   - alerts.service.js       → processAll() revisa watchlist con alertThreshold.
 */

import { HttpError } from '../utils/apiResponse.js';
import { watchlistRepository } from './watchlist.repository.js';
import { marketsRepository } from '../markets/markets.repository.js';

export const watchlistService = {
  async add(userId, { marketId, alertThreshold }) {
    const market = await marketsRepository.findById(marketId);
    if (!market) throw new HttpError(404, 'NOT_FOUND', 'Market not found');

    try {
      return await watchlistRepository.create({ userId, marketId, alertThreshold });
    } catch (err) {
      if (err.code === 'P2002') throw new HttpError(409, 'ALREADY_IN_WATCHLIST', 'Market already in watchlist');
      throw err;
    }
  },

  async remove(userId, marketId) {
    const { count } = await watchlistRepository.deleteByUserAndMarket(userId, marketId);
    if (count === 0) throw new HttpError(404, 'NOT_FOUND', 'Entry not found in watchlist');
  },

  list(userId) {
    return watchlistRepository.findByUser(userId);
  },
};
