/**
 * Rate limiter especifico para el endpoint de login.
 *
 * Responsabilidades:
 *   - Limitar a 5 intentos de login cada 15 minutos por IP.
 *   - Mitigar ataques de fuerza bruta contra credenciales.
 *   - Responder 429 con codigo TOO_MANY_REQUESTS cuando se excede.
 *
 * Aplicado unicamente en POST /api/v1/auth/login.
 * El rate limiter global (200 req / 15 min) tambien protege el resto de la API.
 */

import rateLimit from 'express-rate-limit';

const isProd = process.env.NODE_ENV === 'production';

export const rateLimitLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 5 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many login attempts, try again later' },
  },
});
