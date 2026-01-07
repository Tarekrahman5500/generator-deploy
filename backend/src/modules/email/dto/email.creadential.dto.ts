import { createZodDto } from 'nestjs-zod';
import {
  createEmailCredentialSchema,
  updateEmailCredentialSchema,
} from '../schema';

export class CreateEmailCredentialDto extends createZodDto(
  createEmailCredentialSchema,
) {}

export class UpdateEmailCredentialDto extends createZodDto(
  updateEmailCredentialSchema,
) {}
