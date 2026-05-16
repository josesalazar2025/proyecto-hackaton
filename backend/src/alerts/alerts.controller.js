import { ok } from '../utils/apiResponse.js';
import { alertsService } from './alerts.service.js';

export const alertsController = {
  async list(req, res) {
    const alerts = await alertsService.list(req.user.id, req.query);
    ok(res, alerts);
  },
};
