import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CategoryEntity,
  CategoryFileRelationEntity,
  FieldEntity,
  ProductEntity,
  ProductFileRelationEntity,
  ProductValueEntity,
  SubCategoryEntity,
} from 'src/entities/product';
import {
  CategoryController,
  FieldController,
  GroupController,
  ProductController,
  SubCategoryController,
} from './controller';
import {
  BulkProductService,
  CategoryService,
  FieldService,
  GroupService,
  ProductService,
  SubCategoryService,
} from './service';
import { FileModule } from '../file/file.module';
import { jwtProviders } from 'src/auth/provider';
import { GroupEntity } from 'src/entities/product/group.entity';
import { ProductFieldHelperService } from './service/product-field.helper.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CategoryEntity,
      CategoryFileRelationEntity,
      GroupEntity,
      FieldEntity,
      ProductEntity,
      ProductValueEntity,
      ProductFileRelationEntity,
      SubCategoryEntity,
    ]),
    FileModule,
  ],
  controllers: [
    CategoryController,
    ProductController,
    FieldController,
    GroupController,
    SubCategoryController,
  ],
  providers: [
    ProductService,
    CategoryService,
    FieldService,
    GroupService,
    SubCategoryService,
    BulkProductService,
    ...jwtProviders,
    ProductFieldHelperService,
  ],
  exports: [ProductService, CategoryService, SubCategoryService],
})
export class ProductModule {}
