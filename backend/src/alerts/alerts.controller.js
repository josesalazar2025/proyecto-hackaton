/**
 * Controladores del modulo de alertas.
 *
 * Responsabilidades:
 *   - list(req, res) → devuelve el historial de alertas del usuario autenticado.
 *
 * Endpoint (bajo /api/v1/alerts, protegido por requireAuth):
 *   GET / → lista paginada de alertas.
 */

import { ok } from '../utils/apiResponse.js';
import { alertsService } from './alerts.service.js';

export const alertsController = {
  async list(req, res) {
    const alerts = await alertsService.list(req.user.id, req.query);
    ok(res, alerts);
  },
};
