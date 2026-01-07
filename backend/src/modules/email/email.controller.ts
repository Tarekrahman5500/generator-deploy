import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { apiResponse } from 'src/common/apiResponse/api.response';
import { CreateEmailCredentialDto, UpdateEmailCredentialDto } from './dto';
import { AuthGuard } from 'src/auth/guard';
import { Roles } from 'src/decorator';
import { AdministratorRole } from 'src/common/enums';

@UseGuards(AuthGuard)
@Roles(AdministratorRole.SUPER_ADMIN)
@Controller('email-credentials')
export class EmailController {
  constructor(private readonly emailCredentialService: EmailService) {}

  @Post()
  async create(@Body() dto: CreateEmailCredentialDto) {
    const credential = await this.emailCredentialService.create(dto);
    return apiResponse({
      statusCode: HttpStatus.CREATED,
      payload: { credential },
    });
  }

  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    const data = await this.emailCredentialService.findAll(
      Number(page),
      Number(limit),
    );
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: data,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const credential = await this.emailCredentialService.findOne(id);
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { credential },
    });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateEmailCredentialDto) {
    const credential = await this.emailCredentialService.update(id, dto);
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { credential },
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.emailCredentialService.remove(id);
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: result,
    });
  }
}
