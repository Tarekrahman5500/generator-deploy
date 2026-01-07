import { z } from 'zod';

export const fieldSchema = z.object({
  id: z.uuidv4(),
  fieldName: z.string().nonempty('Field name cannot be empty'),
  groupId: z.uuidv4(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Create
export const fieldCreateSchema = fieldSchema.pick({
  fieldName: true,
  id: true,
});

// Update
export const fieldUpdateSchema = z
  .object({
    id: z.uuidv4(),
    fieldName: z.string().optional(),
    groupId: z.uuidv4().optional(),
  })
  .refine((data) => data.fieldName || data.groupId, {
    message: 'At least one field (fieldName or groupId) is required',
    path: ['fieldName'],
  });
