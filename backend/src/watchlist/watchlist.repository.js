import { prisma } from '../utils/prisma.js';

export const watchlistRepository = {
  create({ userId, marketId, alertThreshold }) {
    return prisma.watchlist.create({ data: { userId, marketId, alertThreshold } });
  },

  findByUser(userId) {
    return prisma.watchlist.findMany({
      where: { userId },
      include: {
        market: { select: { id: true, question: true, yesPrice: true, noPrice: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  deleteByUserAndMarket(userId, marketId) {
    return prisma.watchlist.deleteMany({ where: { userId, marketId } });
  },

  findAllWithThreshold() {
    return prisma.watchlist.findMany({
      where: { alertThreshold: { not: null } },
      include: {
        user: { select: { id: true, telegramChatId: true } },
        market: { select: { id: true, question: true, yesPrice: true } },
      },
    });
  },
};
