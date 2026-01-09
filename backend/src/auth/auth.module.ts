import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Administrator } from 'src/entities/administrator';
import { jwtProviders } from './provider';
import { AuthGuard } from './guard';

@Module({
  imports: [TypeOrmModule.forFeature([Administrator])],
  controllers: [AuthController],
  providers: [AuthService, ...jwtProviders, AuthGuard],
  exports: [AuthService, ...jwtProviders],
})
export class AuthModule {}
