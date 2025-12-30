import { createZodDto } from 'nestjs-zod';
import {
  subCategorySchema,
  subCategoryBulkCreateSchema,
  subCategoryUpdateSchema,
} from '../schema';

// -----------------------------------------------------
// Main DTO
// -----------------------------------------------------
export class SubCategoryDto extends createZodDto(subCategorySchema) {}

// -----------------------------------------------------
// Bulk Create DTO
// -----------------------------------------------------
export class SubCategoryBulkCreateDto extends createZodDto(
  subCategoryBulkCreateSchema,
) {}

// -----------------------------------------------------
// Update DTO
// -----------------------------------------------------
export class SubCategoryUpdateDto extends createZodDto(
  subCategoryUpdateSchema,
) {}
