import { z } from 'zod';

export const dynamicFilterSchema = z
  .object({
    categoryId: z.uuidv4({
      message: 'Category ID is required',
    }),
    subCategoryId: z
      .uuidv4({ message: 'SubCategory ID is required' })
      .optional(),

    modelNames: z
      .array(z.string({ message: 'Model Name is required' }))
      .optional(),
    // dynamic filters (fieldId → value)
    filters: z
      .record(
        z.uuid(),
        z.union([
          z.string(),
          z.number(),
          z
            .object({
              min: z.number(),
              max: z.number(),
            })
            .refine((val) => val.min <= val.max, {
              message: 'Min must be greater than or equal to max',
              path: ['min'],
            }),
        ]),
      )
      .optional(),

    // pagination with validation
    page: z
      .number()
      .int()
      .positive('Page must be a positive integer')
      .default(1)
      .optional(),
    limit: z
      .number()
      .int()
      .positive('Limit must be a positive integer')
      .default(10)
      .optional(),

    // sorting with validation
    sortBy: z.enum(['modelName', 'createdAt']).default('createdAt').optional(),
    sortOrder: z.enum(['ASC', 'DESC']).default('DESC').optional(),
  })
  .strict();

export const singleProductSchema = dynamicFilterSchema
  .pick({
    page: true,
    limit: true,
    sortBy: true,
    sortOrder: true,
  })
  .extend({
    categoryId: z.uuid().optional(),
  });
