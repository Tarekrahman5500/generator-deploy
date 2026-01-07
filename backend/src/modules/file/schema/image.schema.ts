import { z } from 'zod';

export const imageSchema = z
  .string()
  .regex(
    /^[a-f0-9-]+-\d+_.*\.(jpg|jpeg|png|webp)$/i,
    'Invalid image filename format',
  );

export const pdfSchema = z
  .string()
  .regex(/^[a-f0-9-]+-.+\.pdf$/i, 'Invalid PDF filename format');
