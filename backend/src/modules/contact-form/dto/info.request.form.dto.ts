import { createZodDto } from 'nestjs-zod';
import { infoRequestFormSchema } from '../schema';

export class InfoRequestFormDto extends createZodDto(infoRequestFormSchema) {}
