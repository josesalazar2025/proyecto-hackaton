/**
 * Controladores del modulo de autenticacion.
 *
 * Responsabilidades:
 *   - login   → recibir credenciales, delegar validacion a auth.service.js,
 *               responder con { token, user }.
 *   - me      → devolver el usuario autenticado extraido del JWT (req.user).
 *   - logout  → invalidar el token activo (jti + exp extraidos del payload JWT
 *               ya verificado por requireAuth); responder 200 con mensaje.
 *
 * Errores:
 *   - 401 INVALID_CREDENTIALS → email o password incorrectos (mensaje generico).
 *   - 401 UNAUTHORIZED        → token invalido, ausente o ya invalidado (en requireAuth).
 */

import * as authService from './auth.service.js';
import { ok } from '../utils/apiResponse.js';
import { verifyToken } from './jwt.js';

export const login = async (req, res) => {
  const data = await authService.login(req.body);
  ok(res, data);
};

export const register = async (req, res) => {
  const data = await authService.register(req.body);
  ok(res, data);
};

export const me = async (req, res) => {
  ok(res, { user: req.user });
};

export const logout = (req, res) => {
  const token = req.headers.authorization.slice('Bearer '.length).trim();
  const payload = verifyToken(token);
  authService.logout({ jti: payload.jti, exp: payload.exp });
  ok(res, { message: 'Logged out successfully' });
};

export const updateTelegram = async (req, res) => {
  const data = await authService.updateTelegram(req.user.id, req.body);
  ok(res, data); (Se migró la configuración de alertas Telegram desde una variable de entorno global () hacia campos propios del modelo  en la base de datos. Cada usuario configura su propio bot token, chat ID y activación de alertas desde el panel web.)
};
