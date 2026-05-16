import { ok, created, noContent } from '../utils/apiResponse.js';
import { positionsService } from './positions.service.js';

export const positionsController = {
  async open(req, res) {
    const position = await positionsService.open(req.user.id, req.body);
    created(res, position);
  },

  async list(req, res) {
    const positions = await positionsService.list(req.user.id, req.query.status);
    ok(res, positions);
  },

  async close(req, res) {
    const position = await positionsService.close(req.params.id, req.user.id);
    ok(res, position);
  },
};
