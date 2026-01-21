import { z } from 'zod';

export const groupSchema = z.object({
  id: z.uuidv4(),
  serialNo: z
    .number({ message: 'Serial number must be a positive number' })
    .nullable()
    .optional(),
  groupName: z.string(),
  categoryId: z.uuidv4({ message: 'Category ID must be a valid UUID' }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Create
export const groupCreateSchema = groupSchema
  .pick({
    groupName: true,
    categoryId: true,
    serialNo: true,
  })
  .extend({
    fieldNames: z
      .array(
        z.object({
          order: z.boolean().default(false).optional(),
          filter: z.boolean().default(false).optional(),
          name: z.string().min(1, { message: 'Field name cannot be empty' }),
          serialNo: z.number().nullable().optional(),
        }),
      )
      // ✅ Field names must be unique
      .refine((arr) => new Set(arr.map((f) => f.name)).size === arr.length, {
        message: 'Field names must be unique',
      })
      // ✅ Only ONE order:true allowed
      .refine((arr) => arr.filter((f) => f.order === true).length <= 1, {
        message: 'Only one field can have order enabled',
      }),
  });

// Update
export const groupUpdateSchema = z
  .object({
    id: z.uuidv4(),
    groupName: z.string().optional(),
    categoryId: z.uuidv4().optional(),
    serialNo: z.number().nullable().optional(),
  })
  .refine(
    (data) => data.groupName || data.categoryId || data.serialNo !== undefined,
    {
      message:
        'At least one field (groupName or categoryId or serialNo) is required',
      path: ['groupName'],
    },
  );
