// src/schemas/category-info.schema.ts
import { z } from 'zod';

export const categoryInfoSchema = z.object({
  id: z.uuidv4(),
  title: z.string().max(255),
  description: z.string(),
  fileIds: z.array(z.uuidv4()).min(1),
  categoryId: z.uuidv4(),
});

export const categoryInfoCreateSchema = categoryInfoSchema.pick({
  title: true,
  description: true,
  fileIds: true,
  categoryId: true,
});

export const categoryInfoUpdateSchema = categoryInfoSchema.partial();

export type CategoryInfo = z.infer<typeof categoryInfoSchema>;
export type CategoryInfoCreateInput = z.infer<typeof categoryInfoCreateSchema>;
export type CategoryInfoUpdateInput = z.infer<typeof categoryInfoUpdateSchema>;
