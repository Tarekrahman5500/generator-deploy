import { z } from 'zod';

export const fieldSchema = z.object({
  id: z.uuidv4({ message: 'Invalid UUID format for id' }).optional(),
  serialNo: z
    .number({ message: 'Serial number must be a positive number' })
    .nullable()
    .optional(),
  order: z.boolean().default(false).optional(),
  filter: z.boolean().default(false).optional(),
  fieldName: z.string().nonempty('Field name cannot be empty').optional(),
  groupId: z.uuidv4(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Create
export const fieldCreateSchema = fieldSchema.pick({
  fieldName: true,
  id: true,
  serialNo: true,
  order: true,
  filter: true,
});

// Update
export const fieldUpdateSchema = z
  .object({
    id: z.uuidv4(),
    fieldName: z.string().optional(),
    groupId: z.uuidv4().optional(),
    serialNo: z.number().nullable().optional(),
    order: z.boolean().default(false).optional(),
    filter: z.boolean().default(false).optional(),
  })
  .refine(
    (data) =>
      data.fieldName ||
      data.groupId ||
      data.serialNo ||
      data.order ||
      data.filter,
    {
      message:
        'At least one field (fieldName or groupId or serialNo) is required',
      path: ['fieldName'],
    },
  );
