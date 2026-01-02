import { createZodDto } from 'nestjs-zod';
import { emailReplySchema } from '../schema';

export class EmailReplyDto extends createZodDto(emailReplySchema) {}
