/**
 * Helpers para firmar y verificar tokens JWT.
 *
 * Responsabilidades:
 *   - signToken(payload)  → firma un token HS256 con expiracion configurable.
 *   - verifyToken(token)  → verifica firma, expiracion y algoritmo (solo HS256).
 *
 * Consumido por:
 *   - auth.service.js   → al hacer login exitoso.
 *   - requireAuth.js    → en cada peticion protegida.
 *
 * Configuracion:
 *   - JWT_SECRET    : minimo 32 chars (validado en config.js).
 *   - JWT_EXPIRES_IN: default '1h'.
 */

import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export const signToken = (payload) =>
  jwt.sign(payload, config.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: config.JWT_EXPIRES_IN,
  });

export const verifyToken = (token) =>
  jwt.verify(token, config.JWT_SECRET, { algorithms: ['HS256'] });
