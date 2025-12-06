import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CategoryEntity,
  CategoryInfoEntity,
  DieselGeneratorSetEnitiy,
  ForkliftEntity,
  CompressorEntity,
  TowerLightEntity,
  UpsEntity,
  AutomaticTransferSwitchEntity,
  DistributorPanelEntity,
} from 'src/entities/product';
import {
  CategoryController,
  CategoryInfoController,
  ProductController,
} from './controller';
import {
  CategoryInfoService,
  CategoryService,
  ProductService,
} from './service';
import { FileModule } from '../file/file.module';
import { CategoryFileRelationEntity } from 'src/entities/product/category.file.reation.entity';
import { CategoryInfoFileRelationEntity } from 'src/entities/product/category.info.file.relation.entity';
import { DieselGeneratorFileRelationEntity } from 'src/entities/product/diesel.generator.file.relation.entity';
import { ForkliftFileRelationEntity } from 'src/entities/product/forklift.file.relation.entity';
import { CompressorFileRelationEntity } from 'src/entities/product/compressor.file.relation.entity';
import { TowerLightFileRelationEntity } from 'src/entities/product/tower.light.file.relation.entity';
import { UpsFileRelationEntity } from 'src/entities/product/ups.file.relation.entity';
import { AutomaticTransferSwitchFileRelationEntity } from 'src/entities/product/automatic.transfer.switch.file.relation.entity';
import { DistributorPanelFileRelationEntity } from 'src/entities/product/distributor.panel.file.relation.entity';
import { jwtProviders } from 'src/auth/provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CategoryEntity,
      CategoryFileRelationEntity,
      CategoryInfoEntity,
      CategoryInfoFileRelationEntity,
      DieselGeneratorSetEnitiy,
      DieselGeneratorFileRelationEntity,
      ForkliftEntity,
      ForkliftFileRelationEntity,
      CompressorEntity,
      CompressorFileRelationEntity,
      TowerLightEntity,
      TowerLightFileRelationEntity,
      UpsEntity,
      UpsFileRelationEntity,
      AutomaticTransferSwitchEntity,
      AutomaticTransferSwitchFileRelationEntity,
      DistributorPanelEntity,
      DistributorPanelFileRelationEntity,
    ]),
    FileModule,
  ],
  controllers: [CategoryController, CategoryInfoController, ProductController],
  providers: [
    ProductService,
    CategoryService,
    CategoryInfoService,
    ...jwtProviders,
  ],
})
export class ProductModule {}
