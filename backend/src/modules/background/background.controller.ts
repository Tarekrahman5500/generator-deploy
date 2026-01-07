import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BackgroundService } from './background.service';
import { BackgroundBulkCreateDto, BackgroundUpdateDto } from './dto';
import { apiResponse } from 'src/common/apiResponse/api.response';
import { AuthGuard } from 'src/auth/guard';
import { isPublic } from 'src/decorator';

@UseGuards(AuthGuard)
@Controller('background')
export class BackgroundController {
  constructor(private readonly backgroundService: BackgroundService) {}

  // =========================
  // 1️⃣ BULK CREATE
  // =========================
  @Post('bulk')
  async bulkCreate(@Body() dto: BackgroundBulkCreateDto) {
    const result = await this.backgroundService.bulkCreate(dto);

    return apiResponse({
      statusCode: HttpStatus.CREATED,
      payload: { result },
    });
  }

  // =========================
  // 2️⃣ GET ALL (GROUP BY SECTION)
  // =========================
  @isPublic()
  @Get()
  async getAllGroupedBySection() {
    const result = await this.backgroundService.getAllGroupedBySection();

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { result },
    });
  }

  // =========================
  // 3️⃣ GET SINGLE BY ID
  // =========================
  @isPublic()
  @Get(':id')
  async getById(@Param('id') id: string) {
    const result = await this.backgroundService.getById(id);

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { result },
    });
  }

  // =========================
  // 4️⃣ SINGLE UPDATE
  // =========================
  @Patch()
  async update(@Body() dto: BackgroundUpdateDto) {
    const result = await this.backgroundService.update(dto.id, dto);

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { result },
    });
  }

  // =========================
  // 5️⃣ TOGGLE VISIBILITY
  // =========================
  @Patch(':id/toggle-visibility')
  async toggleVisibility(@Param('id') id: string) {
    const result = await this.backgroundService.toggleVisibility(id);

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { result },
    });
  }

  // =========================
  // 6️⃣ SINGLE DELETE
  // =========================
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const result = await this.backgroundService.delete(id);

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { result },
    });
  }
}
