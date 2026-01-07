import { z } from 'zod';

const backgroundSchema = z.object({
  id: z.uuidv4(),
  section: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  fileId: z.uuidv4().nullable().optional(),
  isVisible: z.boolean().optional(),
});

// --------------------------
// Bulk Create
// --------------------------
export const backgroundBulkCreateSchema = z.object({
  items: z.array(backgroundSchema.omit({ id: true })).min(1),
});

// --------------------------
// Update
// --------------------------
export const backgroundUpdateSchema = backgroundSchema
  .partial()
  .extend({
    id: z.uuidv4(),
  })
  .refine(
    (data) => {
      return Object.entries(data).some(
        ([key, value]) => key !== 'id' && value !== undefined,
      );
    },
    {
      message: "At least one field other than 'id' must be provided.",
    },
  );
