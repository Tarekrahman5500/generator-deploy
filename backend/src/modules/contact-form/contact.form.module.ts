import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactFormService } from './contact.from.service';
import {
  ContactFormEntity,
  InfoRequestFormEntity,
} from 'src/entities/contact-form';
import { ContactFromController } from './contact.from.controller';
import { ProductEntity } from 'src/entities/product';
import { jwtProviders } from 'src/auth/provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContactFormEntity,
      InfoRequestFormEntity,
      ProductEntity,
    ]),
  ],
  controllers: [ContactFromController],
  providers: [ContactFormService, ...jwtProviders],
})
export class ContactFormModule {}
