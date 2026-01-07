import { z } from 'zod';

export const groupSchema = z.object({
  id: z.uuidv4(),
  groupName: z.string(),
  categoryId: z.uuidv4(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Create
export const groupCreateSchema = groupSchema
  .pick({
    groupName: true,
    categoryId: true,
  })
  .extend({
    fieldNames: z
      .array(z.string())
      // .nonempty('At least one field name is required')
      .refine((arr) => new Set(arr).size === arr.length, {
        message: 'Field names must be unique',
      }),
  });

// Update
export const groupUpdateSchema = z
  .object({
    id: z.uuidv4(),
    groupName: z.string().optional(),
    categoryId: z.uuidv4().optional(),
  })
  .refine((data) => data.groupName || data.categoryId, {
    message: 'At least one field (groupName or categoryId) is required',
    path: ['groupName'],
  });
