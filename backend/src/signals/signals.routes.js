/**
 * Rutas REST del modulo de senales IA.
 *
 * Endpoint (montado en /api/v1/markets):
 *   GET /:marketId/signal → senal mas reciente del mercado.
 *
 * No requiere autenticacion (datos publicos).
 */

import { Router } from 'express';
import { signalsController } from './signals.controller.js';

const router = Router();

// Batch: últimas señales para múltiples mercados (debe ir ANTES de la ruta dinámica)
// mounted at /api/v1/markets → full path: GET /api/v1/markets/signals/latest?marketIds=id1,id2
router.get('/signals/latest', signalsController.getLatestBatch);

// mounted at /api/v1/markets → full path: GET /api/v1/markets/:marketId/signal
router.get('/:marketId/signal', signalsController.getLatest);

export default router;
