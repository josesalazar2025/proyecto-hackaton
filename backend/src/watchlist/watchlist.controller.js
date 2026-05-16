import { ok, created, noContent } from '../utils/apiResponse.js';
import { watchlistService } from './watchlist.service.js';

export const watchlistController = {
  async add(req, res) {
    const entry = await watchlistService.add(req.user.id, req.body);
    created(res, entry);
  },

  async remove(req, res) {
    await watchlistService.remove(req.user.id, req.params.marketId);
    noContent(res);
  },

  async list(req, res) {
    const entries = await watchlistService.list(req.user.id);
    ok(res, entries);
  },
};
