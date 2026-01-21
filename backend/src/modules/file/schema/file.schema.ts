import { z } from 'zod';

// Response schema (what we return to client after upload)
export const uploadFileResponseSchema = z.object({
  id: z.uuidv4(),
  fileName: z.string(),
  originalName: z.string(),
  url: z.string(),
  mimeType: z.string(),
  size: z.number(),
  createdAt: z.date(),
});

export type UploadFileResponse = z.infer<typeof uploadFileResponseSchema>;

// Query schema (for retrieving files by ID)
export const fileIdParamSchema = z.object({
  id: z.uuid(),
  productId: z.uuid({ message: 'Product ID must be a valid UUID ' }).optional(),
});

export type FileIdParam = z.infer<typeof fileIdParamSchema>;
