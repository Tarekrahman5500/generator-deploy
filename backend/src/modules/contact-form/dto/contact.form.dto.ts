import { createZodDto } from 'nestjs-zod';
import { contactFormSchema } from '../schema';

export class ContactFormDto extends createZodDto(contactFormSchema) {}
