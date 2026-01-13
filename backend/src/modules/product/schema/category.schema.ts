import { z } from 'zod';
import { noCodeDescription } from 'src/common/schema';

export const categorySchema = z.object({
  id: z.uuidv4(),
  categoryName: z.string({ message: 'Category name is required' }),
  serialNo: z
    .number()
    .int()
    .positive({ message: 'Serial number must be a positive integer' })
    .nullable()
    .optional(),
  subCategoryNames: z
    .array(z.string().min(1))
    .min(1)
    .refine((arr) => new Set(arr).size === arr.length, {
      message: 'Sub-category names must be unique',
    }),
  description: noCodeDescription,
  fileIds: z
    .array(
      z.uuidv4({
        message: 'Invalid file ID format',
      }),
    )
    .min(1, 'At least one file must be selected'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Create
export const categoryCreateSchema = categorySchema
  .pick({
    serialNo: true,
    categoryName: true,
    subCategoryNames: true,
    description: true,
    fileIds: true,
  })
  .partial({
    subCategoryNames: true,
  });

// Update
export const categoryUpdateSchema = z
  .object({
    id: z.uuidv4(),
    serialNo: z
      .number()
      .int()
      .positive({ message: 'Serial number must be a positive integer' })
      .nullable()
      .optional(),
    categoryName: z.string().optional(),
    description: noCodeDescription.optional(),
    fileIds: z.array(z.uuidv4()).min(1).optional(),
  })
  .refine((data) => data.description || data.fileIds, {
    message:
      'At least one field (category or description or fileIds) is required',
    path: ['description'],
  });
