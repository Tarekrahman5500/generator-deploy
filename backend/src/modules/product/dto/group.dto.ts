import { createZodDto } from 'nestjs-zod';
import { groupSchema, groupCreateSchema, groupUpdateSchema } from '../schema';

// -----------------------------------------------------
// Main DTO
// -----------------------------------------------------
export class GroupDto extends createZodDto(groupSchema) {}

// -----------------------------------------------------
// Create DTO
// -----------------------------------------------------
export class GroupCreateDto extends createZodDto(groupCreateSchema) {}

// -----------------------------------------------------
// Update DTO
// -----------------------------------------------------
export class GroupUpdateDto extends createZodDto(groupUpdateSchema) {}
