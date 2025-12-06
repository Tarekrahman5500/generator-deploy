// src/dto/category-info.dto.ts
import { createZodDto } from 'nestjs-zod';
import {
  categoryInfoSchema,
  categoryInfoCreateSchema,
  categoryInfoUpdateSchema,
} from '../schema';

// -----------------------------------------------------
// Main DTO
// -----------------------------------------------------
export class CategoryInfoDto extends createZodDto(categoryInfoSchema) {}

// -----------------------------------------------------
// Create DTO
// -----------------------------------------------------
export class CategoryInfoCreateDto extends createZodDto(
  categoryInfoCreateSchema,
) {}

// -----------------------------------------------------
// Update DTO
// -----------------------------------------------------
export class CategoryInfoUpdateDto extends createZodDto(
  categoryInfoUpdateSchema,
) {}
