import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { marketsController } from './markets.controller.js';
import { listQuery, idParam } from './markets.validators.js';

const router = Router();

router.get('/', validate(listQuery, 'query'), marketsController.list);
router.get('/:id', validate(idParam, 'params'), marketsController.getById);

export default router;
