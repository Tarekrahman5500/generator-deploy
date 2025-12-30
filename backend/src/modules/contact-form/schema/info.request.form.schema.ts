import z from 'zod';

export const infoRequestFormSchema = z
  .object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.email('Invalid email address'),
    telephone: z.string().min(1, 'Phone number is required'),
    country: z.string().min(1, 'Country is required'),
    productId: z.uuidv4('Invalid UUID format for Product ID'),
  })
  .strict();
