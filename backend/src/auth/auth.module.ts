import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Administrator, AdministratorToken } from 'src/entities/administrator';
import { jwtProviders } from './provider';
import { AuthGuard } from './guard';
// import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [TypeOrmModule.forFeature([Administrator, AdministratorToken])],
  controllers: [AuthController],
  providers: [
    AuthService,
    ...jwtProviders,
    // { provide: APP_GUARD, useClass: AuthGuard },
    AuthGuard,
  ],
  exports: [AuthService, ...jwtProviders],
})
export class AuthModule {}
