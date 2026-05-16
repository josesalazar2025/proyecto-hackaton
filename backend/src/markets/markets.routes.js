/**
 * Rutas REST del modulo de mercados.
 *
 * Endpoints (montados en /api/v1/markets):
 *   GET /           → listado paginado/filtrado (validate listQuery en query).
 *   GET /:id        → detalle de mercado (validate idParam en params).
 *
 * No requieren autenticacion (datos publicos de Polymarket).
 */

import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { marketsController } from './markets.controller.js';
import { listQuery, idParam } from './markets.validators.js';

const router = Router();

router.get('/', validate(listQuery, 'query'), marketsController.list);
router.get('/:id', validate(idParam, 'params'), marketsController.getById);

export default router;
