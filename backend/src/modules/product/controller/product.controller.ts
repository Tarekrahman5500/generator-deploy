import {
  Controller,
  Post,
  Body,
  Query,
  BadRequestException,
  Get,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { ProductService } from '../service';
import { ProductDto, ProductSoftDeleteDto, ProductUpdateDto } from '../dto';
import { productSchema, productUpdateSchema } from '../schema';
import { apiResponse } from 'src/common/apiResponse/api.response';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async createProduct(@Body() dto: ProductDto) {
    try {
      // console.log(dto);
      const validatedData = productSchema.parse(dto);
      const product = await this.productService.productCreate(validatedData);

      return apiResponse({
        statusCode: HttpStatus.OK,
        payload: { product },
      });
    } catch (error) {
      throw error;
    }
  }

  @Patch()
  async updateProduct(@Body() productUpdateDto: ProductUpdateDto) {
    try {
      const validatedData = productUpdateSchema.parse(productUpdateDto);

      const product = await this.productService.productUpdate(validatedData);
      return apiResponse({
        statusCode: HttpStatus.OK,
        payload: { product },
      });
    } catch (error) {
      throw error;
    }
  }

  @Patch('soft-delete')
  async productSoftDelete(@Body() productSoftDeleteDto: ProductSoftDeleteDto) {
    const product =
      await this.productService.productSoftDelete(productSoftDeleteDto);

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { product },
    });
  }

  @Get()
  async getProductByIdAndType(
    @Query('id') id: string,
    @Query('type') type: string,
  ) {
    if (!id) {
      throw new BadRequestException('Product ID is required');
    }

    if (!type) {
      throw new BadRequestException('Product type is required');
    }

    const product = await this.productService.getSingleProductByIdAndType(
      id,
      type,
    );

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { product },
    });
  }
}
