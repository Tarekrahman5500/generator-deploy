import { z } from 'zod';

/**
 * =========================
 * BASE EMAIL REPLY SCHEMA
 * =========================
 */
export const emailReplySchema = z.object({
  id: z.uuidv4(),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be at most 200 characters'),

  body: z.string().min(1, 'Email body is required'),
  repliedByAdminId: z.uuidv4(),
  parentId: z.uuidv4(),
  fileIds: z.array(z.uuidv4()).optional(),
});

/**
 * =========================
 * CREATE EMAIL REPLY
 * =========================
 */
export const emailReplyCreateSchema = emailReplySchema.pick({
  subject: true,
  body: true,
  parentId: true,
  fileIds: true,
});
