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
