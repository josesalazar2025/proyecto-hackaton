/**
 * Controladores del modulo de autenticacion.
 *
 * Responsabilidades:
 *   - login  → recibir credenciales, delegar validacion a auth.service.js,
 *              responder con { token, user }.
 *   - me     → devolver el usuario autenticado extraido del JWT (req.user).
 *
 * Errores:
 *   - 401 INVALID_CREDENTIALS → email o password incorrectos (mensaje generico).
 *   - 401 UNAUTHORIZED        → token invalido o ausente (en requireAuth).
 */

import * as authService from './auth.service.js';
import { ok } from '../utils/apiResponse.js';

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
