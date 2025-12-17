import { Body, Controller, Get, HttpStatus, Post, Query } from '@nestjs/common';
import { ContactFormService } from './contact.from.service';
import { ContactFormDto, InfoRequestFormDto } from './dto';
import { apiResponse } from 'src/common/apiResponse/api.response';

@Controller('contact-form')
export class ContactFromController {
  constructor(private readonly contactFormService: ContactFormService) {}

  @Post()
  async createContactForm(@Body() contactFormDto: ContactFormDto) {
    const contactFrom =
      await this.contactFormService.createContactFrom(contactFormDto);

    return apiResponse({
      statusCode: HttpStatus.CREATED,
      payload: { contactFrom },
    });
  }

  @Post('info-request')
  async createInfoRequestForm(@Body() infoRequestFormDto: InfoRequestFormDto) {
    const infoRequest =
      await this.contactFormService.createInfoRequestFrom(infoRequestFormDto);

    return apiResponse({
      statusCode: HttpStatus.CREATED,
      payload: { infoRequest },
    });
  }

  @Get()
  async getAllContactForms(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const pageNumber = Math.max(Number(page), 1);
    const pageSize = Math.min(Math.max(Number(limit), 1), 100);
    const allContactForms = await this.contactFormService.getAllContactFrom(
      pageNumber,
      pageSize,
    );
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { ...allContactForms },
    });
  }

  @Get('info-request')
  async getAllInfoRequestForms(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const pageNumber = Math.max(Number(page), 1);
    const pageSize = Math.min(Math.max(Number(limit), 1), 100);
    const allInfoRequests = await this.contactFormService.getAllInfoRequestFrom(
      pageNumber,
      pageSize,
    );
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { ...allInfoRequests },
    });
  }
}
