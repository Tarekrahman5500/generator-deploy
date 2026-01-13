import { z } from 'zod';

export const dynamicFilterSchema = z
  .object({
    categoryId: z.uuidv4({
      message: 'Category ID is required',
    }),
    subCategoryId: z
      .uuidv4({ message: 'SubCategory ID is required' })
      .optional(),

    modelName: z.string({ message: 'Model Name is required' }).optional(),
    // dynamic filters (fieldId → value)
    filters: z
      .record(
        z.string({ message: 'Field ID is required' }),
        z.string({ message: 'Value is required' }),
      )
      .optional(),

    // range filters
    prpMin: z.number().min(0, 'PRP minimum must be 0 or greater').optional(),
    prpMax: z.number().min(0, 'PRP maximum must be 0 or greater').optional(),
    ltpMin: z.number().min(0, 'LTP minimum must be 0 or greater').optional(),
    ltpMax: z.number().min(0, 'LTP maximum must be 0 or greater').optional(),

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
  .refine(
    (data) => {
      // Validate that prpMin <= prpMax if both are provided
      if (data.prpMin !== undefined && data.prpMax !== undefined) {
        return data.prpMin <= data.prpMax;
      }
      return true;
    },
    {
      message: 'prpMin must be less than or equal to prpMax',
      path: ['prpMin'],
    },
  )
  .refine(
    (data) => {
      // Validate that ltpMin <= ltpMax if both are provided
      if (data.ltpMin !== undefined && data.ltpMax !== undefined) {
        return data.ltpMin <= data.ltpMax;
      }
      return true;
    },
    {
      message: 'ltpMin must be less than or equal to ltpMax',
      path: ['ltpMin'],
    },
  );
