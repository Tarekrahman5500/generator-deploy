import { z } from 'zod';

export const subCategorySchema = z.object({
  id: z.uuidv4(),
  subCategoryNames: z
    .array(z.string().min(1))
    .min(1)
    .refine((arr) => new Set(arr).size === arr.length, {
      message: 'Sub-category names must be unique',
    }),
  categoryId: z.uuidv4(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Create (bulk)
 */
export const subCategoryBulkCreateSchema = subCategorySchema.pick({
  categoryId: true,
  subCategoryNames: true,
});

/**
 * Update (single)
 */
export const subCategoryUpdateSchema = z.object({
  subCategoryName: z.string().min(1),
});

export type SubCategorySchema = z.infer<typeof subCategorySchema>;
export type SubCategoryBulkCreateSchema = z.infer<
  typeof subCategoryBulkCreateSchema
>;
export type SubCategoryUpdateSchema = z.infer<typeof subCategoryUpdateSchema>;
