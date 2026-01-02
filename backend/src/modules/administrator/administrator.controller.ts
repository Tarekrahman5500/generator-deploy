import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, RolesGuard } from 'src/auth/guard';
import { AdministratorRole } from 'src/common/enums';
import { Roles } from 'src/decorator';
import { AdminUpdateDto } from './dto';
import { AdministratorService } from './administrator.service';
import { apiResponse } from 'src/common/apiResponse/api.response';

@UseGuards(AuthGuard, RolesGuard)
@Roles(AdministratorRole.SUPER_ADMIN)
@Controller('administrator')
export class AdmnistratorController {
  constructor(private readonly administratorService: AdministratorService) {}
  @Get()
  async getAllAdmins() {
    const admins = await this.administratorService.getAllAdmins();

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { admins },
    });
  }
  @Patch()
  async updateAdmin(@Body() adminUpdateDto: AdminUpdateDto) {
    const updateAdmin =
      await this.administratorService.updateAdmin(adminUpdateDto);

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { updateAdmin },
    });
  }
}
