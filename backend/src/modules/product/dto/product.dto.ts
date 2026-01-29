import { createZodDto } from 'nestjs-zod';
import {
  bulkDeleteProductSchema,
  createProductSchema,
  groupFieldsSchema,
  productCompareScheme,
  productCreateGroupSchema,
  productQuerySchema,
  productUpsertSchema,
  updateProductSchema,
} from '../schema';

export class CreateProductDto extends createZodDto(createProductSchema) {}
export class UpdateProductDto extends createZodDto(updateProductSchema) {}

export class ProductCreateGroupDto extends createZodDto(
  productCreateGroupSchema,
) {}

export class GroupFieldsDto extends createZodDto(groupFieldsSchema) {}

export class ProductFilterDto extends createZodDto(productQuerySchema) {}

export class ProductCompareDto extends createZodDto(productCompareScheme) {}

export class ProductUpsertDto extends createZodDto(productUpsertSchema) {}

export class BulkDeleteProductDto extends createZodDto(
  bulkDeleteProductSchema,
) {}
