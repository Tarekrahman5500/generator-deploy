import { createZodDto } from 'nestjs-zod';
import { fieldSchema, fieldCreateSchema, fieldUpdateSchema } from '../schema';

// -----------------------------------------------------
// Main DTO
// -----------------------------------------------------
export class FieldDto extends createZodDto(fieldSchema) {}

// -----------------------------------------------------
// Create DTO
// -----------------------------------------------------
export class FieldCreateDto extends createZodDto(fieldCreateSchema) {}

// -----------------------------------------------------
// Update DTO
// -----------------------------------------------------
export class FieldUpdateDto extends createZodDto(fieldUpdateSchema) {}
