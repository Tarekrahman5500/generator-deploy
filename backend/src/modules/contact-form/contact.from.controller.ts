import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ContactFormService } from './contact.from.service';
import { ContactFormDto, EmailReplyDto, InfoRequestFormDto } from './dto';
import { apiResponse } from 'src/common/apiResponse/api.response';
import { AuthGuard } from 'src/auth/guard';
import { isPublic } from 'src/decorator';

@UseGuards(AuthGuard)
@Controller('contact-form')
export class ContactFromController {
  constructor(private readonly contactFormService: ContactFormService) {}

  @isPublic()
  @Post()
  async createContactForm(@Body() contactFormDto: ContactFormDto) {
    const contactFrom =
      await this.contactFormService.createContactFrom(contactFormDto);

    return apiResponse({
      statusCode: HttpStatus.CREATED,
      payload: { contactFrom },
    });
  }

  @isPublic()
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

  // ---------------- Email Replies ----------------
  @Post('reply/contact')
  async replyContactForm(@Body() dto: EmailReplyDto, @Req() req) {
    const repliedByAdminId = req.user.id;
    const reply = await this.contactFormService.contactFormEmailReply(
      dto,
      repliedByAdminId,
    );
    return apiResponse({
      statusCode: HttpStatus.CREATED,
      payload: { reply },
    });
  }

  @Post('reply/info-request')
  async replyInfoRequestForm(@Body() dto: EmailReplyDto, @Req() req) {
    const repliedByAdminId = req.user.id;
    const reply = await this.contactFormService.infoRequestFormEmailReply(
      dto,
      repliedByAdminId,
    );
    return apiResponse({
      statusCode: HttpStatus.CREATED,
      payload: { reply },
    });
  }

  // ---------------- List Replies ----------------
  @Get('reply/contact')
  async getAllContactFormEmailReply(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const pageNumber = Math.max(Number(page), 1);
    const pageSize = Math.min(Math.max(Number(limit), 1), 100);
    const replies = await this.contactFormService.getAllContactFormEmailReply(
      pageNumber,
      pageSize,
    );
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: replies,
    });
  }

  @Get('reply/info-request')
  async getAllInfoRequestFormEmailReply(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const pageNumber = Math.max(Number(page), 1);
    const pageSize = Math.min(Math.max(Number(limit), 1), 100);
    const replies =
      await this.contactFormService.getAllInfoRequestFormEmailReply(
        pageNumber,
        pageSize,
      );
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: replies,
    });
  }
}
