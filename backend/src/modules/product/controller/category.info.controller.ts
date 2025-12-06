import { Controller, Post, Get, Body, HttpStatus } from '@nestjs/common';
import { CategoryInfoCreateDto } from '../dto';
import { CategoryInfoService } from '../service';
import { apiResponse } from 'src/common/apiResponse/api.response';

@Controller('category-info')
export class CategoryInfoController {
  constructor(private readonly categoryInfoService: CategoryInfoService) {}

  @Post()
  async createCategoryInfo(@Body() dto: CategoryInfoCreateDto) {
    const categoryInfo = await this.categoryInfoService.createCategoryInfo(dto);
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { categoryInfo },
    });
  }

  @Get()
  async getAllCategoryInfo() {
    const categoryInfos = await this.categoryInfoService.findAllCategoryInfo();
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { categoryInfos },
    });
  }
}
