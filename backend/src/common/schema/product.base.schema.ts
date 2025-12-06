// Add a base schema with common fields
import { z } from 'zod';

export const baseProductSchema = z.object({
  categoryId: z.uuid(), // Add categoryId to base schema
});
