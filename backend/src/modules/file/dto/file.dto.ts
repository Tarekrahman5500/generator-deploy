import { createZodDto } from 'nestjs-zod';
import {
  uploadFileResponseSchema,
  fileIdParamSchema,
} from '../schema/file.schema';

export class UploadFileResponseDto extends createZodDto(
  uploadFileResponseSchema,
) {}

export class FileIdParamDto extends createZodDto(fileIdParamSchema) {}
