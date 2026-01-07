import { z } from 'zod';

export const productQuerySchema = z.object({
  categoryId: z.uuid().optional(),
  page: z.preprocess((v) => Number(v) || 1, z.number().min(1)),
  limit: z.preprocess((v) => Number(v) || 10, z.number().min(1).max(100)),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['ASC', 'DESC']).optional(),
  groupName: z.string().optional(),
  fieldName: z.string().optional(),
  value: z.string().optional(),
  modelName: z.string().optional(),
});
