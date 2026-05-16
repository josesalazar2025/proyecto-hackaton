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
