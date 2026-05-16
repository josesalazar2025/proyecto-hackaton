import { z } from 'zod';

export const listQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  category: z.enum(['politics', 'crypto', 'economics', 'sports']).optional(),
  status: z.enum(['active', 'closed', 'resolved']).default('active'),
});

export const idParam = z.object({
  id: z.string().min(1),
});
