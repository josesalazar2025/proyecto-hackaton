/**
 * Helpers para firmar y verificar tokens JWT.
 *
 * Responsabilidades:
 *   - signToken(payload)        → firma un token HS256 con expiracion configurable.
 *                                 Incluye claim `jti` (UUID v4) para poder invalidarlo.
 *   - verifyToken(token)        → verifica firma, expiracion y algoritmo (solo HS256).
 *   - addToDenylist(jti, exp)   → anota el jti como invalidado hasta su expiracion.
 *   - isBlocked(jti)            → true si el jti esta en la denylist.
 *   - pruneExpiredDenylist()    → elimina entradas ya expiradas (llamado en cada logout).
 *
 * Denylist:
 *   - En memoria (Map<jti, expEpochMs>). Sin persistencia entre reinicios.
 *   - Aceptable porque el TTL del token es 1h; al reiniciar el servidor
 *     cualquier token antiguo expirara por si solo antes de que importe.
 *
 * Consumido por:
 *   - auth.service.js   → signToken al hacer login; addToDenylist al hacer logout.
 *   - requireAuth.js    → verifyToken + isBlocked en cada peticion protegida.
 *
 * Configuracion:
 *   - JWT_SECRET    : minimo 32 chars (validado en config.js).
 *   - JWT_EXPIRES_IN: default '1h'.
 */

import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

/** @type {Map<string, number>} jti → expiry timestamp (ms) */
const denylist = new Map();

export const signToken = (payload) =>
  jwt.sign({ ...payload, jti: randomUUID() }, config.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: config.JWT_EXPIRES_IN,
  });

export const verifyToken = (token) =>
  jwt.verify(token, config.JWT_SECRET, { algorithms: ['HS256'] });

export const addToDenylist = (jti, exp) => {
  pruneExpiredDenylist();
  denylist.set(jti, exp * 1000);
};

export const isBlocked = (jti) => {
  const exp = denylist.get(jti);
  if (exp === undefined) return false;
  if (Date.now() > exp) { denylist.delete(jti); return false; }
  return true;
};

export const pruneExpiredDenylist = () => {
  const now = Date.now();
  for (const [jti, exp] of denylist) {
    if (now > exp) denylist.delete(jti);
  }
};
