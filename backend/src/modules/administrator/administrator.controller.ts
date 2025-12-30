import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  // UseGuards,
} from '@nestjs/common';
// import { AuthGuard, RolesGuard } from 'src/auth/guard';
// import { AdministratorRole } from 'src/common/enums';
// import { Roles } from 'src/decorator';
import { AdminUpdateDto } from './dto';
import { AdministratorService } from './administrator.service';
import { apiResponse } from 'src/common/apiResponse/api.response';
// import { EmailService } from '../email/email.service';

//@UseGuards(AuthGuard, RolesGuard)
//@Roles(AdministratorRole.SUPER_ADMIN)

@Controller('administrator')
export class AdmnistratorController {
  constructor(
    private readonly administratorService: AdministratorService,
    // private readonly emailService: EmailService,
  ) {}
  @Get()
  async getAllAdmins() {
    const admins = await this.administratorService.getAllAdmins();

    // const data = await this.emailService.sendEmail({
    //   to: 'sourovsarker005@gmail.com',
    //   subject: 'Test Email from Maresix',
    //   html: '<h1>This is a test email sent from Maresix application.</h1><p>If you received this email, the email service is working correctly.</p>',
    // });

    // console.log('Email sent response:', data);
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
