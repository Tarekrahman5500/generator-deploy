import { Module } from '@nestjs/common';
import { SearchController } from './controller/search.controller';
import { SearchService } from './services/search.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CategoryEntity,
  FieldEntity,
  ProductEntity,
  ProductValueEntity,
  SubCategoryEntity,
} from 'src/entities/product';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      CategoryEntity,
      FieldEntity,
      ProductValueEntity,
      SubCategoryEntity,
    ]),
    ProductModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
