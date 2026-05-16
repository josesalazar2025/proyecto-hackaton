import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import { alertsController } from './alerts.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', alertsController.list);

export default router;
