/**
 * Repositorio de acceso a datos para el modelo Market.
 *
 * Responsabilidades:
 *   - findMany({ limit, offset, category, status }) → listado paginado y filtrado.
 *   - count({ category, status })                    → conteo para paginacion.
 *   - findById(id)                                   → busqueda por ID nativo.
 *   - upsert(market)                                 → crea o actualiza un mercado.
 *
 * Todas las operaciones usan Prisma ORM (queries parametrizadas, sin SQL injection).
 * El orden por defecto es descendente por volumen (volumeEur).
 */

import { prisma } from '../utils/prisma.js';

export const marketsRepository = {
  findMany({ limit, offset, category, status }) {
    const where = { status };
    if (category) where.category = category;
    return prisma.market.findMany({
      where,
      orderBy: { volumeEur: 'desc' },
      take: limit,
      skip: offset,
    });
  },

  count({ category, status }) {
    const where = { status };
    if (category) where.category = category;
    return prisma.market.count({ where });
  },

  findById(id) {
    return prisma.market.findUnique({ where: { id } });
  },

  upsert(market) {
    return prisma.market.upsert({
      where: { id: market.id },
      update: market,
      create: market,
    });
  },
};
