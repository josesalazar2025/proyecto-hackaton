/**
 * Esquemas Zod para validar inputs del modulo de posiciones.
 *
 * Responsabilidades:
 *   - openBody  → marketId (string), outcome ('YES'|'NO'), amountEur (positivo, max 100k).
 *   - idParam   → coerce a numero entero positivo.
 *   - listQuery → status opcional ('open'|'closed').
 *
 * Consumido por:
 *   - positions.routes.js → validate() en POST, GET y DELETE.
 */

import { z } from 'zod';

export const openBody = z.object({
  marketId: z.string().min(1),
  outcome: z.enum(['YES', 'NO']),
  amountEur: z.number().positive().max(100_000),
});

export const idParam = z.object({
  id: z.coerce.number().int().positive(),
});

export const listQuery = z.object({
  status: z.enum(['open', 'closed']).optional(),
});
