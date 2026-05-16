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
