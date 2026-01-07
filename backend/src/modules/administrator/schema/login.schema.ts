import { z } from 'zod';
import { emailSchema } from './base.schema';

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string(),
});

export const tokenSchema = z.object({
  refreshToken: z.string().min(6, 'Refresh token'),
  accessToken: z.string().min(6, 'Access token'),
});

export const refreshToken = tokenSchema.pick({
  refreshToken: true,
});
