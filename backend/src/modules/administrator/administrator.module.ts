import { Module } from '@nestjs/common';
import { AdministratorService } from './administrator.service';
import { AdmnistratorController } from './administrator.controller';
import { Administrator } from 'src/entities/administrator';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Administrator]), AuthModule, EmailModule],
  exports: [],
  providers: [AdministratorService],
  controllers: [AdmnistratorController],
})
export class AdministratorModule {}
