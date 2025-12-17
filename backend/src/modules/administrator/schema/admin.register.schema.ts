import { AdministratorRole } from 'src/common/enums';
import { z } from 'zod';
import { emailSchema, passwordSchema } from './base.schema';

export const adminRegisterSchema = z.object({
  email: emailSchema,

  userName: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters'),

  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      'Invalid international phone number format (E.164)',
    ),

  password: passwordSchema,

  role: z.enum(AdministratorRole).default(AdministratorRole.ADMIN).optional(),
});

export const adminUpdateSchema = adminRegisterSchema
  .pick({
    email: true,
    userName: true,
    phone: true,
    password: true,
  })
  .partial()
  .extend({
    id: z.uuidv4(),
  })
  .refine(
    (data) => data.email || data.userName || data.phone || data.password,
    {
      message:
        'At least one field (email, userName, phone, password) is required to update.',
      path: ['_error'],
    },
  );
