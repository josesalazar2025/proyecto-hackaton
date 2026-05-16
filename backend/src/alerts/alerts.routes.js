/**
 * Rutas REST del modulo de alertas.
 *
 * Endpoint (montado en /api/v1/alerts):
 *   GET / → listar alertas del usuario autenticado.
 *
 * Requiere autenticacion JWT (router.use(requireAuth)).
 */

import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import { alertsController } from './alerts.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', alertsController.list);

export default router;
