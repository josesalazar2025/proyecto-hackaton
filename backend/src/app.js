/**
 * Aplicacion Express principal — configuracion de middlewares y montaje de rutas.
 *
 * Middlewares aplicados (en orden):
 *   1. helmet()            — headers de seguridad (X-Frame-Options, HSTS, etc.).
 *   2. cors()              — CORS con origen configurable (CORS_ORIGIN).
 *   3. rateLimit()         — 200 peticiones / 15 min por IP.
 *   4. express.json()      — parseo de JSON con limite de 1 MB.
 *
 * Rutas REST montadas bajo /api/v1:
 *   - /auth       → login, perfil (auth.routes.js)
 *   - /markets    → listado y detalle de mercados (markets.routes.js)
 *   - /markets    → senales IA por mercado (signals.routes.js, subruta)
 *   - /positions  → simulador de posiciones virtuales (positions.routes.js)
 *   - /watchlist  → lista de seguimiento (watchlist.routes.js)
 *   - /alerts     → historial de alertas (alerts.routes.js)
 *   - /health     → healthcheck basico
 *
 * Manejo de errores:
 *   - notFound      → 404 para rutas no definidas.
 *   - errorHandler  → 500 generico en produccion, detalles en desarrollo.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { ok } from './utils/apiResponse.js';
import authRoutes from './auth/auth.routes.js';
import marketsRoutes from './markets/markets.routes.js';
import signalsRoutes from './signals/signals.routes.js';
import positionsRoutes from './positions/positions.routes.js';
import watchlistRoutes from './watchlist/watchlist.routes.js';
import alertsRoutes from './alerts/alerts.routes.js';
import statsRoutes from './stats/stats.routes.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));

// Rate limit: muy permisivo en desarrollo, restrictivo en producción
const rateLimitMax = config.NODE_ENV === 'production' ? 200 : 5000;
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded' } },
  }),
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/v1/health', (_req, res) => ok(res, { status: 'up' }));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/markets', marketsRoutes);
app.use('/api/v1/markets', signalsRoutes);
app.use('/api/v1/positions', positionsRoutes);
app.use('/api/v1/watchlist', watchlistRoutes);
app.use('/api/v1/alerts', alertsRoutes);
app.use('/api/v1/stats', statsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
