import { Module } from '@nestjs/common';
import { SearchController } from './controller/search.controller';
import { SearchService } from './services/search.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CategoryEntity,
  FieldEntity,
  ProductEntity,
  ProductValueEntity,
} from 'src/entities/product';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      CategoryEntity,
      FieldEntity,
      ProductValueEntity,
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
