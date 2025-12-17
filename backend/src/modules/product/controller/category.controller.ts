import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpStatus,
  // Query,
  UseGuards,
  Patch,
  Query,
  Delete,
} from '@nestjs/common';
import { CategoryCreateDto, CategoryUpdateDto, ProductFilterDto } from '../dto';
import { CategoryService, ProductService } from '../service';
import { apiResponse } from 'src/common/apiResponse/api.response';
import { AuthGuard } from 'src/auth/guard';

@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly productService: ProductService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  async createCategory(@Body() dto: CategoryCreateDto) {
    const category = await this.categoryService.createCategory(dto);
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { category },
    });
  }

  // @UseGuards(AuthGuard)
  @Patch()
  async updateCategory(@Body() categoryUpdateDto: CategoryUpdateDto) {
    const category =
      await this.categoryService.categoryUpdate(categoryUpdateDto);

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { category },
    });
  }

  @Get()
  async getAllCategories(@Query('page') page = 1, @Query('limit') limit = 10) {
    const pageNumber = Math.max(Number(page), 1);
    const pageSize = Math.min(Math.max(Number(limit), 1), 100);

    const result = await this.categoryService.findAllCategories(
      pageNumber,
      pageSize,
    );

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { ...result },
    });
  }

  // @Get('products/:categoryId')
  // async getCategoryProduct(
  //   @Param('categoryId') categoryId: string,
  //   @Query('page') page?: number,
  //   @Query('limit') limit?: number,
  // ) {
  //   const products = await this.productService.getCategoryProducts(
  //     categoryId,
  //     page,
  //     limit,
  //   );

  //   return apiResponse({
  //     statusCode: HttpStatus.OK,
  //     payload: products,
  //   });
  // }

  @Get('/list')
  async getAllCategoryList() {
    const categories =
      await this.categoryService.getAllCategoriesNameAndDescription();

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { categories },
    });
  }

  @Get('/products')
  async getCategoryProducts(@Query() dto: ProductFilterDto) {
    // console.log(dto);
    const category = await this.productService.findProductsByCategory(dto);
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { category },
    });
  }

  @Get(':id')
  async getCategory(@Param('id') id: string) {
    const category = await this.categoryService.findCategoryById(id);
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { category },
    });
  }

  @Delete('soft-delete/:id')
  async softDeleteCategory(@Param('id') id: string) {
    const result = await this.categoryService.categorySoftDelete(id);
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: result,
    });
  }
}
