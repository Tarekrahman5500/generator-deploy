import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  HttpStatus,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { FieldService } from '../service';
import { FieldCreateDto, FieldUpdateDto } from '../dto';
import { apiResponse } from 'src/common/apiResponse/api.response';
import { AuthGuard } from 'src/auth/guard';

@Controller('field')
@UseGuards(AuthGuard)
export class FieldController {
  constructor(private readonly fieldService: FieldService) {}

  // ------------------------------------------------------------
  // Create Field
  // ------------------------------------------------------------
  @Post()
  async createField(@Body() dto: FieldCreateDto) {
    const field = await this.fieldService.createField(dto);
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { field },
    });
  }

  // ------------------------------------------------------------
  // Update Field
  // ------------------------------------------------------------
  @Patch()
  async updateField(@Body() dto: FieldUpdateDto) {
    const field = await this.fieldService.updateField(dto);
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { field },
    });
  }

  // ------------------------------------------------------------
  // Get All Fields
  // ------------------------------------------------------------
  @Get()
  async getAllFields() {
    const fields = await this.fieldService.findAllFields();
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { fields },
    });
  }

  // ------------------------------------------------------------
  // Get Field by ID
  // ------------------------------------------------------------
  @Get(':id')
  async getField(@Param('id') id: string) {
    const field = await this.fieldService.findFieldById(id);
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { field },
    });
  }

  // ------------------------------------------------------------
  // Get Fields by Group ID
  // ------------------------------------------------------------
  @Get('group/:groupId')
  async getFieldsByGroup(@Param('groupId') groupId: string) {
    const fields = await this.fieldService.findFieldsByGroupId(groupId);
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { fields },
    });
  }

  // ------------------------------------------------------------
  // Delete Field
  // ------------------------------------------------------------
  @Delete(':id')
  async deleteField(@Param('id') id: string) {
    await this.fieldService.deleteField(id);
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { message: 'Field deleted successfully' },
    });
  }
}
