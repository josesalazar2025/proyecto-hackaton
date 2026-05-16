/**
 * Controladores del modulo de posiciones (simulador virtual).
 *
 * Responsabilidades:
 *   - open(req, res)   → abre una posicion virtual en un mercado.
 *   - list(req, res)   → lista las posiciones del usuario autenticado.
 *   - close(req, res)  → cierra una posicion y calcula P&L final.
 *
 * Endpoints (bajo /api/v1/positions, protegidos por requireAuth):
 *   POST /       → abrir posicion.
 *   GET /        → listar posiciones (opcional ?status=open|closed).
 *   DELETE /:id  → cerrar posicion.
 */

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
