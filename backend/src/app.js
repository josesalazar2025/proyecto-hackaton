import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { ok } from './utils/apiResponse.js';
import authRoutes from './auth/auth.routes.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/v1/health', (_req, res) => ok(res, { status: 'up' }));
app.use('/api/v1/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
