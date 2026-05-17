/**
 * Rutas REST de autenticacion.
 *
 * Endpoints:
 *   POST /api/v1/auth/login
 *     → rateLimitLogin (5 intentos / 15 min)
 *     → validate(loginSchema)
 *     → authController.login
 *     → Devuelve JWT + objeto usuario.
 *
 *   GET /api/v1/auth/me
 *     → requireAuth
 *     → authController.me
 *     → Devuelve el usuario autenticado (req.user).
 */

import { Router } from 'express';
import * as ctrl from './auth.controller.js';
import { loginSchema, registerSchema } from './auth.validators.js';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { rateLimitLogin } from '../middlewares/rateLimitLogin.js';

const router = Router();

router.post('/login', rateLimitLogin, validate(loginSchema), ctrl.login);
router.post('/register', validate(registerSchema), ctrl.register);
router.get('/me', requireAuth, ctrl.me);

export default router;
