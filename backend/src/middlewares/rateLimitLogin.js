import rateLimit from 'express-rate-limit';

export const rateLimitLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many login attempts, try again later' },
  },
});
