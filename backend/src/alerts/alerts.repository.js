import { prisma } from '../utils/prisma.js';

export const alertsRepository = {
  create({ userId, marketId, type, message }) {
    return prisma.alert.create({ data: { userId, marketId, type, message } });
  },

  findByUser(userId, { limit = 50, offset = 0 } = {}) {
    return prisma.alert.findMany({
      where: { userId },
      orderBy: { sentAt: 'desc' },
      take: limit,
      skip: offset,
      include: { market: { select: { id: true, question: true } } },
    });
  },

  findRecent(userId, marketId, type, windowMs) {
    return prisma.alert.findFirst({
      where: { userId, marketId, type, sentAt: { gte: new Date(Date.now() - windowMs) } },
    });
  },
};
