/**
 * Rutas REST del modulo de lista de seguimiento (watchlist).
 *
 * Endpoints (montados en /api/v1/watchlist):
 *   POST /              → anadir mercado (validate addBody).
 *   GET /               → listar watchlist.
 *   DELETE /:marketId   → eliminar mercado (validate marketIdParam en params).
 *
 * Todas las rutas requieren autenticacion JWT (router.use(requireAuth)).
 */

import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { watchlistController } from './watchlist.controller.js';
import { addBody, marketIdParam } from './watchlist.validators.js';

const router = Router();

router.use(requireAuth);

router.post('/', validate(addBody), watchlistController.add);
router.get('/', watchlistController.list);
router.delete('/:marketId', validate(marketIdParam, 'params'), watchlistController.remove);

export default router;
