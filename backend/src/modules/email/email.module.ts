import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { jwtProviders } from 'src/auth/provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailCredentialEntity } from 'src/entities/email';
import { EmailController } from './email.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EmailCredentialEntity])],
  providers: [EmailService, ...jwtProviders],
  controllers: [EmailController],
  exports: [EmailService],
})
export class EmailModule {}
