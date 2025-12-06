// src/dto/category.dto.ts
import { createZodDto } from 'nestjs-zod';
import {
  categorySchema,
  categoryCreateSchema,
  categoryUpdateSchema,
} from '../schema';

// -----------------------------------------------------
// Main DTO
// -----------------------------------------------------
export class CategoryDto extends createZodDto(categorySchema) {}

// -----------------------------------------------------
// Create DTO
// -----------------------------------------------------
export class CategoryCreateDto extends createZodDto(categoryCreateSchema) {}

// -----------------------------------------------------
// Update DTO
// -----------------------------------------------------
export class CategoryUpdateDto extends createZodDto(categoryUpdateSchema) {}
