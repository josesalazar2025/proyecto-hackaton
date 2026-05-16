/**
 * Controladores del modulo de lista de seguimiento (watchlist).
 *
 * Responsabilidades:
 *   - add(req, res)    → anade un mercado a la watchlist con umbral de alerta opcional.
 *   - remove(req, res) → elimina un mercado de la watchlist.
 *   - list(req, res)   → devuelve la watchlist del usuario autenticado.
 *
 * Endpoints (bajo /api/v1/watchlist, protegidos por requireAuth):
 *   POST /              → anadir mercado.
 *   GET /               → listar watchlist.
 *   DELETE /:marketId   → eliminar mercado.
 */

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
