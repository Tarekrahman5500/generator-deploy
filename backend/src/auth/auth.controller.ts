import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto } from 'src/modules/administrator/dto';
import { apiResponse } from 'src/common/apiResponse/api.response';
import { AuthGuard } from './guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const tokens = await this.authService.login(loginDto);

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { tokens },
    });
  }

  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const tokens = await this.authService.refreshToken(refreshTokenDto);

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { tokens },
    });
  }

  @UseGuards(AuthGuard)
  @Post('verify-token')
  async verifyToken(@Request() req) {
    const isValid = req.user ? true : false;

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { isValid },
    });
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    const userId: string = req.user.id;

    const logout = await this.authService.logout(userId);

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { logout },
    });
  }
}
