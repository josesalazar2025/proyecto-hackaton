import { z } from 'zod';

export const addBody = z.object({
  marketId: z.string().min(1),
  alertThreshold: z.number().min(0).max(1).optional(),
});

export const marketIdParam = z.object({
  marketId: z.string().min(1),
});
