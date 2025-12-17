import z from 'zod';

export const contactFormSchema = z
  .object({
    fullName: z.string().min(1, 'Full name is required'),
    company: z.string().min(1, 'Company is required'),
    email: z.string().email('Invalid email address'),
    telephone: z.string().min(1, 'Phone number is required'),
    country: z.string().min(1, 'Country is required'),
    message: z.string().min(1, 'Message is required'),
  })
  .strict();
