// src/schemas/category.schema.ts
import { z } from 'zod';
import { categoryInfoSchema } from './category.info.schema';
import { Categories } from 'src/common/enums';
import { noCodeDescription } from 'src/common/schema';

export const categorySchema = z.object({
  id: z.uuidv4(),
  categoryName: z.enum(Object.values(Categories)),
  description: noCodeDescription,
  fileIds: z.array(z.uuidv4()).min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
  infos: z.array(categoryInfoSchema).optional(),
});

// Create
export const categoryCreateSchema = categorySchema.pick({
  categoryName: true,
  description: true,
  fileIds: true,
});

// Update
export const categoryUpdateSchema = z
  .object({
    id: z.uuidv4(),
    description: z.string().min(100).optional(),
    fileIds: z.array(z.string().uuid()).min(1).optional(),
  })
  .refine((data) => data.description || data.fileIds, {
    message: 'At least one field (description or fileIds) is required',
    path: ['description'],
  });

// Types
export type Category = z.infer<typeof categorySchema>;
export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
