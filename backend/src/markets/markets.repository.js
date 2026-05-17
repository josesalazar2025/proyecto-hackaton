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
    // Ordenamos por liquidez (lo realmente tradeable AHORA) y luego volumen
    // como desempate. Esto evita que los whales politicos historicos copen
    // siempre la primera pagina.
    return prisma.market.findMany({
      where,
      orderBy: [{ liquidityEur: 'desc' }, { volumeEur: 'desc' }],
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

  /**
   * Marca como 'closed' los mercados activos que NO esten en la lista de IDs.
   * Se invoca despues de un sync para purgar mercados que ya no aparecen
   * en el fetch curado por tags (evita mostrar restos de syncs anteriores).
   *
   * @param {string[]} activeIds - IDs presentes en el ultimo sync.
   * @returns {Promise<number>} Numero de mercados marcados como cerrados.
   */
  async deactivateStale(activeIds) {
    const result = await prisma.market.updateMany({
      where: {
        id: { notIn: activeIds },
        status: 'active',
      },
      data: { status: 'closed' },
    });
    return result.count;
  },

  /**
   * Selecciona un conjunto diversificado de mercados activos, ponderado por
   * liquidez+volumen y distribuido entre categorias de alto valor accionable.
   *
   * Categorias prioritarias (peso = numero de mercados pedidos):
   *   - cripto, economía, geopolítica → mayor peso (mas alpha financiero)
   *   - política, ciencia              → peso medio
   *   - entretenimiento, deportes, general → peso bajo (relleno si sobra)
   *
   * @param {number} total - Numero total deseado (default 40).
   * @returns {Promise<Market[]>}
   */
  async findDiversified(total = 40) {
    const weights = {
      'cripto': 0.20,
      'economía': 0.18,
      'geopolítica': 0.18,
      'política': 0.14,
      'ciencia': 0.12,
      'entretenimiento': 0.08,
      'deportes': 0.05,
      'general': 0.05,
    };

    const slices = await Promise.all(
      Object.entries(weights).map(async ([category, weight]) => {
        const take = Math.max(1, Math.round(total * weight));
        // Score: ordenamos por liquidez DESC para priorizar mercados tradeables
        return prisma.market.findMany({
          where: { status: 'active', category },
          orderBy: [{ liquidityEur: 'desc' }, { volumeEur: 'desc' }],
          take,
        });
      }),
    );

    const picked = slices.flat();
    const seen = new Set(picked.map((m) => m.id));

    // Si no llegamos al total (categoria vacia), rellenamos con los mas liquidos restantes
    if (picked.length < total) {
      const remaining = total - picked.length;
      const filler = await prisma.market.findMany({
        where: { status: 'active', id: { notIn: Array.from(seen) } },
        orderBy: [{ liquidityEur: 'desc' }, { volumeEur: 'desc' }],
        take: remaining,
      });
      picked.push(...filler);
    }

    return picked.slice(0, total);
  },
};
