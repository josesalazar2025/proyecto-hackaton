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
 *
 *   POST /api/v1/auth/logout
 *     → requireAuth (verifica token valido y no bloqueado)
 *     → authController.logout
 *     → Invalida el jti del token en la denylist; responde 200.
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
router.post('/logout', requireAuth, ctrl.logout);
router.put('/telegram', requireAuth, ctrl.updateTelegram); (Se migró la configuración de alertas Telegram desde una variable de entorno global () hacia campos propios del modelo  en la base de datos. Cada usuario configura su propio bot token, chat ID y activación de alertas desde el panel web.)

export default router;
