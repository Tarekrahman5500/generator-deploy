import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { jwtProviders } from 'src/auth/provider';

@Module({
  providers: [EmailService, ...jwtProviders],
  exports: [EmailService],
})
export class EmailModule {}
