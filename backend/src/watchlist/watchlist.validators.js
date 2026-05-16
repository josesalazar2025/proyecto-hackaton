/**
 * Esquemas Zod para validar inputs del modulo de watchlist.
 *
 * Responsabilidades:
 *   - addBody       → marketId (string), alertThreshold opcional (0.0 a 1.0).
 *   - marketIdParam → string no vacio para el parametro :marketId.
 *
 * Consumido por:
 *   - watchlist.routes.js → validate() en POST y DELETE.
 */

import { z } from 'zod';

export const addBody = z.object({
  marketId: z.string().min(1),
  alertThreshold: z.number().min(0).max(1).optional(),
});

export const marketIdParam = z.object({
  marketId: z.string().min(1),
});
