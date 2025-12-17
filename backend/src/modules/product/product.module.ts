import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CategoryEntity,
  CategoryFileRelationEntity,
  FieldEntity,
  ProductEntity,
  ProductFileRelationEntity,
  ProductValueEntity,
} from 'src/entities/product';
import {
  CategoryController,
  FieldController,
  GroupController,
  ProductController,
} from './controller';
import {
  CategoryService,
  FieldService,
  GroupService,
  ProductService,
} from './service';
import { FileModule } from '../file/file.module';
import { jwtProviders } from 'src/auth/provider';
import { GroupEntity } from 'src/entities/product/group.entity';

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
    ]),
    FileModule,
  ],
  controllers: [
    CategoryController,
    ProductController,
    FieldController,
    GroupController,
  ],
  providers: [
    ProductService,
    CategoryService,
    FieldService,
    GroupService,
    ...jwtProviders,
  ],
})
export class ProductModule {}
