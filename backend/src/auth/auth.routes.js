import { Router } from 'express';
import * as ctrl from './auth.controller.js';
import { loginSchema } from './auth.validators.js';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { rateLimitLogin } from '../middlewares/rateLimitLogin.js';

const router = Router();

router.post('/login', rateLimitLogin, validate(loginSchema), ctrl.login);
router.get('/me', requireAuth, ctrl.me);

export default router;
