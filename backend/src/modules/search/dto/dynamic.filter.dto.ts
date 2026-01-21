import { createZodDto } from 'nestjs-zod';
import { dynamicFilterSchema, singleProductSchema } from '../schema';

export class DynamicFilterDto extends createZodDto(dynamicFilterSchema) {}

export class SingleProductDto extends createZodDto(singleProductSchema) {}
