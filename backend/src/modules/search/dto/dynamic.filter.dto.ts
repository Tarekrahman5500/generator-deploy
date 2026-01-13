import { createZodDto } from 'nestjs-zod';
import { dynamicFilterSchema } from '../schema';

export class DynamicFilterDto extends createZodDto(dynamicFilterSchema) {}
