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
