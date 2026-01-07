import { createZodDto } from 'nestjs-zod';
import { backgroundBulkCreateSchema, backgroundUpdateSchema } from '../schema';

export class BackgroundBulkCreateDto extends createZodDto(
  backgroundBulkCreateSchema,
) {}

export class BackgroundUpdateDto extends createZodDto(backgroundUpdateSchema) {}
