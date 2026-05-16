/**
 * Instancia singleton de PrismaClient.
 *
 * Responsabilidades:
 *   - Gestionar la conexion a SQLite (desarrollo) o PostgreSQL (produccion).
 *   - Reutilizar la misma instancia en hot-reload (guardada en globalThis).
 *   - Loguear solo warns y errores para no saturar la salida.
 *
 * Relaciones:
 *   - Todos los repositories importan este prisma para ejecutar queries.
 *   - schema.prisma define los modelos: User, Market, AISignal, Position, Watchlist, Alert.
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__prisma__ ??
  new PrismaClient({
    log: ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma__ = prisma;
}
