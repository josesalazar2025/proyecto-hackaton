/**
 * Repositorio de acceso a datos para el modelo AISignal.
 *
 * Responsabilidades:
 *   - create(data)          → inserta una nueva senal generada por IA.
 *   - findLatestByMarket(id) → devuelve la senal mas reciente de un mercado.
 *
 * Campos persistidos:
 *   signal, confidence, summary, keyRisk, newsCount, modelVersion, generatedAt.
 *
 * Todas las operaciones usan Prisma ORM.
 */

import { prisma } from '../utils/prisma.js';

export const signalsRepository = {
  create({ marketId, signal, confidence, summary, keyRisk, newsCount, modelVersion }) {
    return prisma.aISignal.create({
      data: { marketId, signal, confidence, summary, keyRisk, newsCount, modelVersion },
    });
  },

  findLatestByMarket(marketId) {
    return prisma.aISignal.findFirst({
      where: { marketId },
      orderBy: { generatedAt: 'desc' },
    });
  },

  findLatestForMarkets(marketIds) {
    if (!marketIds || marketIds.length === 0) return Promise.resolve([]);
    return prisma.aISignal.findMany({
      where: { marketId: { in: marketIds } },
      orderBy: [{ marketId: 'asc' }, { generatedAt: 'desc' }],
    }).then((rows) => {
      // Tomar solo la más reciente por marketId
      const seen = new Set();
      return rows.filter((r) => {
        if (seen.has(r.marketId)) return false;
        seen.add(r.marketId);
        return true;
      });
    });
  },
};
