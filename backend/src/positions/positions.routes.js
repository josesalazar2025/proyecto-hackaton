/**
 * Rutas REST del modulo de posiciones (simulador virtual).
 *
 * Endpoints (montados en /api/v1/positions):
 *   POST /       → abrir posicion (validate openBody).
 *   GET /        → listar posiciones (validate listQuery en query).
 *   DELETE /:id  → cerrar posicion (validate idParam en params).
 *
 * Todas las rutas requieren autenticacion JWT (router.use(requireAuth)).
 */

import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { positionsController } from './positions.controller.js';
import { openBody, idParam, listQuery } from './positions.validators.js';

const router = Router();

router.use(requireAuth);

router.post('/', validate(openBody), positionsController.open);
router.get('/', validate(listQuery, 'query'), positionsController.list);
router.delete('/:id', validate(idParam, 'params'), positionsController.close);

export default router;
