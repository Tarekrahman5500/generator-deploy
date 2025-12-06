import { createZodDto } from 'nestjs-zod';
import {
  adminRegisterSchema,
  adminUpdateSchema,
  loginSchema,
  refreshToken,
  tokenSchema,
} from '../schema';

export class LoginDto extends createZodDto(loginSchema) {}
export class AdminRegisterDto extends createZodDto(adminRegisterSchema) {}
export class AdminUpdateDto extends createZodDto(adminUpdateSchema) {}
export class TokenDto extends createZodDto(tokenSchema) {}
export class RefreshTokenDto extends createZodDto(refreshToken) {}
