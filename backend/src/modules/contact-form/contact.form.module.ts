import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactFormService } from './contact.from.service';
import {
  ContactFormEmailReplyEntity,
  ContactFormEmailReplyFileRelationEntity,
  ContactFormEntity,
  InfoRequestEmailReplyEntity,
  InfoRequestEmailReplyFileRelationEntity,
  InfoRequestFormEntity,
} from 'src/entities/contact-form';
import { ContactFromController } from './contact.from.controller';
import { ProductEntity } from 'src/entities/product';
import { jwtProviders } from 'src/auth/provider';
import { FileModule } from '../file/file.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContactFormEntity,
      InfoRequestFormEntity,
      ProductEntity,
      ContactFormEmailReplyEntity,
      ContactFormEmailReplyFileRelationEntity,
      InfoRequestEmailReplyEntity,
      InfoRequestEmailReplyFileRelationEntity,
    ]),
    FileModule,
    EmailModule,
  ],
  controllers: [ContactFromController],
  providers: [ContactFormService, ...jwtProviders],
})
export class ContactFormModule {}
