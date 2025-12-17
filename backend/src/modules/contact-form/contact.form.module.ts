import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactFormService } from './contact.from.service';
import {
  ContactFormEntity,
  InfoRequestFormEntity,
} from 'src/entities/contact-form';
import { ContactFromController } from './contact.from.controller';
import { ProductEntity } from 'src/entities/product';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContactFormEntity,
      InfoRequestFormEntity,
      ProductEntity,
    ]),
  ],
  controllers: [ContactFromController],
  providers: [ContactFormService],
})
export class ContactFormModule {}
