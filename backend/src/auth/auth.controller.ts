import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from 'src/modules/administrator/dto';
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

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout() {
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { message: 'Logout Successfully' },
    });
  }
}
