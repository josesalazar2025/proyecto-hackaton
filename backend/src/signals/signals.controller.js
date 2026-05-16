import { ok } from '../utils/apiResponse.js';
import { signalsService } from './signals.service.js';

export const signalsController = {
  async getLatest(req, res) {
    const signal = await signalsService.getLatest(req.params.marketId);
    ok(res, signal);
  },
};
