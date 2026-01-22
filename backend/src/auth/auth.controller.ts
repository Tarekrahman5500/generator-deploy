import {
  Body,
  Controller,
  HttpStatus,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from 'src/modules/administrator/dto';
import { apiResponse } from 'src/common/apiResponse/api.response';
import { AuthGuard } from './guard';
import { ACCESS_JWT } from './provider';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(ACCESS_JWT)
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const tokens = await this.authService.login(loginDto);

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { tokens },
    });
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout() {
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { message: 'Logout Successfully' },
    });
  }

  @Post('verify-token')
  async verifyToken(@Req() req) {
    const token = req.headers.authorization?.split(' ')[1];
    try {
      await this.jwtService.verifyAsync(token);
      return apiResponse({
        statusCode: HttpStatus.OK,
        payload: { isValid: true },
      });
      // eslint-disable-next-line
    } catch (e: any) {
      return apiResponse({
        statusCode: HttpStatus.OK,
        payload: { isValid: false },
      });
    }
  }
}
