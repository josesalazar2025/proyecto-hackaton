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
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
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

app.use(notFound);
app.use(errorHandler);

export default app;
