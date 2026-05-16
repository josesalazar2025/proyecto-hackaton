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
