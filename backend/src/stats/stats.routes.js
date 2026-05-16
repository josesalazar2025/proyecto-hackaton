/**
 * Rutas REST de estadisticas globales (publicas).
 *
 * Endpoint (montado en /api/v1/stats):
 *   GET / → estadisticas agregadas del sistema.
 *
 * Datos expuestos:
 *   - marketsCount  : total de mercados activos.
 *   - volume24h     : suma de volumen de mercados activos.
 *   - signalsCount  : total de senales IA generadas.
 *   - alertsToday   : alertas enviadas en las ultimas 24h.
 */

import { Router } from 'express';
import { prisma } from '../utils/prisma.js';
import { ok } from '../utils/apiResponse.js';

const router = Router();

router.get('/', async (_req, res) => {
  const [marketsCount, signalsCount, alertsToday] = await Promise.all([
    prisma.market.count({ where: { status: 'active' } }),
    prisma.aISignal.count(),
    prisma.alert.count({
      where: { sentAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
  ]);

  const volumeAgg = await prisma.market.aggregate({
    where: { status: 'active' },
    _sum: { volumeEur: true },
  });

  ok(res, {
    marketsCount,
    volume24h: volumeAgg._sum.volumeEur || 0,
    signalsCount,
    alertsToday,
  });
});

export default router;
