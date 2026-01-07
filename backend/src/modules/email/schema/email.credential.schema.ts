import { z } from 'zod';

export const emailCredentialSchema = z.object({
  id: z.uuidv4(),
  apiKey: z.string().min(1),
  fromEmail: z.email(),
  isActive: z.boolean().default(true).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/* Create */
export const createEmailCredentialSchema = emailCredentialSchema.pick({
  apiKey: true,
  fromEmail: true,
  isActive: true,
});

/* Update */
export const updateEmailCredentialSchema = emailCredentialSchema
  .pick({
    apiKey: true,
    fromEmail: true,
    isActive: true,
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type CreateEmailCredentialDto = z.infer<
  typeof createEmailCredentialSchema
>;
export type UpdateEmailCredentialDto = z.infer<
  typeof updateEmailCredentialSchema
>;
