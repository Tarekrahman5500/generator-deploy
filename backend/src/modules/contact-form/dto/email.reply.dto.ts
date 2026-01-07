import { createZodDto } from 'nestjs-zod';
import { emailReplyCreateSchema } from '../schema';

export class EmailReplyDto extends createZodDto(emailReplyCreateSchema) {}
