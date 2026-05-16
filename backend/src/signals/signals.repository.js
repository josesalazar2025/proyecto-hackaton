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
};
