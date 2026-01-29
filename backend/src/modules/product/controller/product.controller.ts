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
import {
  BulkDeleteProductDto,
  CreateProductDto,
  ProductCompareDto,
  ProductCreateGroupDto,
  ProductUpsertDto,
} from '../dto';
import { BulkProductService, ProductService } from '../service';
import { apiResponse } from 'src/common/apiResponse/api.response';
import { AuthGuard } from 'src/auth/guard';
import { isPublic } from 'src/decorator';

@UseGuards(AuthGuard)
@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly bulkProductService: BulkProductService,
  ) {}
  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    const product = await this.productService.createProduct(createProductDto);
    return apiResponse({
      statusCode: HttpStatus.CREATED,
      payload: { product },
    });
  }

  @Patch()
  async upsertProduct(@Body() productUpsertDto: ProductUpsertDto) {
    const product = await this.productService.upsertProduct(productUpsertDto);
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { product },
    });
  }

  @Post('group')
  async productCreateWithGroup(
    @Body() createProductDto: ProductCreateGroupDto,
  ) {
    const product =
      await this.productService.productCreateWithGroup(createProductDto);
    return apiResponse({
      statusCode: HttpStatus.CREATED,
      payload: { groupProduct: product },
    });
  }

  @Get('missing-field/:id')
  async getProductMissingFields(@Param('id') productId: string) {
    const missingFields =
      await this.productService.productMissingFields(productId);

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { missingFields },
    });
  }

  @isPublic()
  @Get(':id')
  async getProductDetails(@Param('id') productId: string) {
    const productDetails =
      await this.productService.getProductDetails(productId);
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { productDetails },
    });
  }

  @isPublic()
  @Post('compare')
  async compareProducts(@Body() productCompareDto: ProductCompareDto) {
    const comparedProducts =
      await this.productService.compareProducts(productCompareDto);
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { comparedProducts },
    });
  }

  @Patch('soft-delete/:id')
  async softDeleteProduct(@Param('id') productId: string) {
    const result = await this.productService.softDeleteProduct(productId);
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { result },
    });
  }

  @Delete('delete-field-value/:id')
  async deleteProductFieldValues(@Param('id') productId: string) {
    await this.productService.productFieldValueDelete(productId);
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: {},
    });
  }

  @Post('execl-genset-add')
  async execlGensetAdd(
    @Body() body: { categoryId: string; fileId: string; imageFileId: string },
  ) {
    const { categoryId, fileId, imageFileId } = body;
    const result = await this.bulkProductService.productCreateByExecl(
      categoryId,
      fileId,
      imageFileId,
    );

    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: { result },
    });
  }

  @Delete()
  async deleteSelectedProducts(@Body() dto: BulkDeleteProductDto) {
    const result = await this.productService.deleteProductByIds(dto.ids);
    return apiResponse({
      statusCode: HttpStatus.OK,
      payload: result,
    });
  }
}
