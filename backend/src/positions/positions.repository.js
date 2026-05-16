import { prisma } from '../utils/prisma.js';

export const positionsRepository = {
  create(data) {
    return prisma.position.create({ data });
  },

  findByUser(userId, status) {
    return prisma.position.findMany({
      where: { userId, ...(status ? { status } : {}) },
      include: { market: { select: { id: true, question: true, yesPrice: true, noPrice: true, status: true } } },
      orderBy: { openedAt: 'desc' },
    });
  },

  findByIdAndUser(id, userId) {
    return prisma.position.findFirst({ where: { id, userId } });
  },

  findAllOpen() {
    return prisma.position.findMany({
      where: { status: 'open' },
      include: { market: { select: { yesPrice: true, noPrice: true } } },
    });
  },

  update(id, data) {
    return prisma.position.update({ where: { id }, data });
  },
};
