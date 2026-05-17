/**
 * Esquemas Zod para validar inputs del modulo de mercados.
 *
 * Responsabilidades:
 *   - listQuery → limit (1-100, default 20), offset, category enum, status enum.
 *   - idParam   → string no vacio para el parametro :id.
 *
 * Consumido por:
 *   - markets.routes.js → validate(listQuery, 'query') y validate(idParam, 'params').
 */

import { z } from 'zod';

export const listQuery = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(60),
  offset: z.coerce.number().int().min(0).default(0),
  // Acepta cualquier categoria (las del DB estan en espanol y son dinamicas).
  category: z.string().optional(),
  status: z.enum(['active', 'closed', 'resolved']).default('active'),
});

export const idParam = z.object({
  id: z.string().min(1),
});
