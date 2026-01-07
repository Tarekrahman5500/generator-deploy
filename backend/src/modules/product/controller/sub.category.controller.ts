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
import { SubCategoryService } from '../service';
import { SubCategoryBulkCreateDto, SubCategoryUpdateDto } from '../dto';
import { apiResponse } from 'src/common/apiResponse/api.response';
import { AuthGuard } from 'src/auth/guard';
import { isPublic } from 'src/decorator';

@UseGuards(AuthGuard)
@Controller('sub-category')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}

  // =========================
  // 1️⃣ BULK CREATE
  // =========================
  @Post()
  async bulkCreate(@Body() dto: SubCategoryBulkCreateDto) {
    const subCategories = await this.subCategoryService.bulkSubCategoryCreate(
      dto.categoryId,
      dto.subCategoryNames,
    );

    return apiResponse({
      statusCode: HttpStatus.CREATED,
      payload: { subCategories },
    });
  }

  // =========================
  // 2️⃣ SINGLE GET
  // =========================
  @isPublic()
  @Get(':id')
  async getOne(@Param('id') id: string) {
    const subCategory = await this.subCategoryService.getSubCategoryById(id);
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { subCategory },
    });
  }

  // =========================
  // 3️⃣ SINGLE UPDATE
  // =========================
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: SubCategoryUpdateDto) {
    const subCategory = await this.subCategoryService.updateSubCategory(
      id,
      dto.subCategoryName,
    );
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { subCategory },
    });
  }

  // =========================
  // 4️⃣ SINGLE DELETE
  // =========================
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const result = await this.subCategoryService.deleteSubCategory(id);
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { result },
    });
  }
}
