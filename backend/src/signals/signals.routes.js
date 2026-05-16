import { Router } from 'express';
import { signalsController } from './signals.controller.js';

const router = Router();

// mounted at /api/v1/markets → full path: GET /api/v1/markets/:marketId/signal
router.get('/:marketId/signal', signalsController.getLatest);

export default router;
