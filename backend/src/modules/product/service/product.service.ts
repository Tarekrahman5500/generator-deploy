import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  Repository,
  EntityTarget,
  ObjectLiteral,
  In,
} from 'typeorm';

import {
  DieselGeneratorSetEnitiy,
  ForkliftEntity,
  CompressorEntity,
  TowerLightEntity,
  UpsEntity,
  AutomaticTransferSwitchEntity,
  DistributorPanelEntity,
  DieselGeneratorFileRelationEntity,
  ForkliftFileRelationEntity,
  CompressorFileRelationEntity,
  TowerLightFileRelationEntity,
  UpsFileRelationEntity,
  AutomaticTransferSwitchFileRelationEntity,
  DistributorPanelFileRelationEntity,
} from 'src/entities/product';

import { Categories } from 'src/common/enums';
import { ProductDto, ProductSoftDeleteDto, ProductUpdateDto } from '../dto';
import { CategoryService } from './category.service';
import { FileService } from 'src/modules/file/file.service';

// Union type for all product entities
type ProductEntity =
  | DieselGeneratorSetEnitiy
  | ForkliftEntity
  | CompressorEntity
  | TowerLightEntity
  | UpsEntity
  | AutomaticTransferSwitchEntity
  | DistributorPanelEntity;

// Union type for all file relation entities
type ProductFileRelationEntity =
  | DieselGeneratorFileRelationEntity
  | ForkliftFileRelationEntity
  | CompressorFileRelationEntity
  | TowerLightFileRelationEntity
  | UpsFileRelationEntity
  | AutomaticTransferSwitchFileRelationEntity
  | DistributorPanelFileRelationEntity;

@Injectable()
export class ProductService {
  private readonly productRepoMap: Record<
    Categories,
    Repository<ProductEntity>
  >;
  private readonly productFileRelationConfig: Record<
    Categories,
    {
      entity: EntityTarget<ProductFileRelationEntity>;
      fkField: string;
    }
  >;

  constructor(
    private readonly categoryService: CategoryService,
    private readonly fileService: FileService,
    private readonly dataSource: DataSource,

    @InjectRepository(DieselGeneratorSetEnitiy)
    private readonly dieselRepo: Repository<DieselGeneratorSetEnitiy>,

    @InjectRepository(ForkliftEntity)
    private readonly forkliftRepo: Repository<ForkliftEntity>,

    @InjectRepository(CompressorEntity)
    private readonly compressorRepo: Repository<CompressorEntity>,

    @InjectRepository(TowerLightEntity)
    private readonly towerLightRepo: Repository<TowerLightEntity>,

    @InjectRepository(UpsEntity)
    private readonly upsRepo: Repository<UpsEntity>,

    @InjectRepository(AutomaticTransferSwitchEntity)
    private readonly atsRepo: Repository<AutomaticTransferSwitchEntity>,

    @InjectRepository(DistributorPanelEntity)
    private readonly distributorPanelRepo: Repository<DistributorPanelEntity>,
  ) {
    this.productRepoMap = {
      [Categories.DIESEL_GENERATOR]: this.dieselRepo,
      [Categories.FORKLIFT]: this
        .forkliftRepo as unknown as Repository<ProductEntity>,
      [Categories.COMPRESSOR]: this
        .compressorRepo as unknown as Repository<ProductEntity>,
      [Categories.TOWER_LIGHT]: this
        .towerLightRepo as unknown as Repository<ProductEntity>,
      [Categories.UPS]: this.upsRepo,
      [Categories.AUTOMATIC_TRANSFER_SWITCH]: this.atsRepo,
      [Categories.DISTRIBUTOR_PANEL]: this.distributorPanelRepo,
    };

    this.productFileRelationConfig = {
      [Categories.DIESEL_GENERATOR]: {
        entity: DieselGeneratorFileRelationEntity,
        fkField: 'dieselGeneratorId',
      },
      [Categories.FORKLIFT]: {
        entity: ForkliftFileRelationEntity,
        fkField: 'forkliftId',
      },
      [Categories.COMPRESSOR]: {
        entity: CompressorFileRelationEntity,
        fkField: 'compressorId',
      },
      [Categories.TOWER_LIGHT]: {
        entity: TowerLightFileRelationEntity,
        fkField: 'towerLightId',
      },
      [Categories.UPS]: {
        entity: UpsFileRelationEntity,
        fkField: 'upsId',
      },
      [Categories.AUTOMATIC_TRANSFER_SWITCH]: {
        entity: AutomaticTransferSwitchFileRelationEntity,
        fkField: 'automaticTransferSwitchId',
      },
      [Categories.DISTRIBUTOR_PANEL]: {
        entity: DistributorPanelFileRelationEntity,
        fkField: 'distributorPanelId',
      },
    };
  }

  async productCreate(productDto: ProductDto) {
    const { fileIds, ...productData } = productDto;

    const category = await this.categoryService.findCategoryById(
      productDto.categoryId,
    );

    if (!category) throw new NotFoundException('Category not found');

    const categoryEnum = category.categoryName as Categories;
    const repo = this.productRepoMap[categoryEnum];

    const relationConfig = this.productFileRelationConfig[categoryEnum];

    if (!repo) {
      throw new BadRequestException(
        `No repository found for ${category.categoryName}`,
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      // 1️⃣ Create product
      const product = await manager.save(repo.target, productData);

      // 2️⃣ Check existing files
      if (fileIds && fileIds.length > 0) {
        const files = await this.fileService.getFileByIds(fileIds, manager);

        if (!files || files.length !== fileIds.length) {
          throw new NotFoundException('Files are not found');
        }

        // 3️⃣ Update usedAt for files
        await this.fileService.usedAtUpdate(fileIds, manager);

        // 4️⃣ Create product-file relations
        if (relationConfig) {
          // const relations = fileIds.map((fileId) =>
          //   manager.create(relationConfig.entity, {
          //     [relationConfig.fkField]: (product as ObjectLiteral).id,
          //     fileId,
          //   }),
          // );

          // await manager.save(relationConfig.entity, relations);
          const relationsPayload = fileIds.map((fileId) => ({
            [relationConfig.fkField]: (product as ObjectLiteral).id,
            fileId,
          }));

          // 5️⃣ Bulk insert relations
          const relations = manager.create(
            relationConfig.entity,
            relationsPayload,
          );
          await manager.save(relationConfig.entity, relations);
        }
      }

      return product;
    });
  }

  async getCategoryProducts(id: string, page = 1, limit = 10) {
    // 1. Validate category
    const category = await this.categoryService.findCategoryById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const categoryEnum = category.categoryName as Categories;
    const repo = this.productRepoMap[categoryEnum];
    const relationConfig = this.productFileRelationConfig[categoryEnum];

    if (!repo) {
      throw new BadRequestException(
        `No repository found for category: ${category.categoryName}`,
      );
    }

    // Ensure numeric pagination
    page = Number(page);
    limit = Number(limit);
    const skip = (page - 1) * limit;

    // Build query with file relations
    const queryBuilder = repo
      .createQueryBuilder('product')
      .where('product.categoryId = :categoryId', { categoryId: id })
      .skip(skip)
      .take(limit);

    // Join file relations using entity relations
    if (relationConfig) {
      // `fileRelations` is the property name in the product entity
      queryBuilder
        .leftJoinAndSelect('product.fileRelations', 'fileRelation')
        .leftJoinAndSelect('fileRelation.file', 'file');
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSingleProductByIdAndType(id: string, type: string) {
    // 1️⃣ Validate category type
    const categoryEnum = type as Categories;

    const repo = this.productRepoMap[categoryEnum];
    const relationConfig = this.productFileRelationConfig[categoryEnum];

    if (!repo) {
      throw new BadRequestException(
        `No repository found for category: ${type}`,
      );
    }

    // 2️⃣ Build query
    const queryBuilder = repo
      .createQueryBuilder('product')
      .where('product.id = :id', { id });

    // 3️⃣ Include file relations if available
    if (relationConfig) {
      const relationAlias = 'fileRelation';
      const fileAlias = 'file';

      queryBuilder
        .leftJoinAndSelect(`product.fileRelations`, relationAlias)
        .leftJoinAndSelect(`${relationAlias}.file`, fileAlias);
    }

    // 4️⃣ Execute query
    const product = await queryBuilder.getOne();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async productUpdate(updateProductDto: ProductUpdateDto) {
    const { id, type, fileIds, ...updateData } = updateProductDto;

    const categoryEnum = type as Categories;
    const repo = this.productRepoMap[categoryEnum];
    const relationConfig = this.productFileRelationConfig[categoryEnum];

    const repoInstance = this.dataSource.getRepository(repo.target);

    const existingProduct = await repoInstance.findOne({
      where: { id },
      relations: relationConfig ? ['fileRelations'] : [],
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    return await this.dataSource.transaction(async (manager) => {
      // Update main product
      await manager.update(repo.target, { id }, updateData);

      // Handle File Relations
      if (fileIds !== undefined) {
        const oldRelations = relationConfig
          ? (existingProduct.fileRelations ?? [])
          : [];

        const oldFileIds = oldRelations.map((rel) => rel.fileId);
        const newFileIds = fileIds;

        const toRemove = oldFileIds.filter((id) => !newFileIds.includes(id));
        const toAdd = newFileIds.filter((id) => !oldFileIds.includes(id));

        // Remove old relations
        if (toRemove.length > 0) {
          await manager.delete(relationConfig.entity, {
            [relationConfig.fkField]: id,
            fileId: In(toRemove),
          });
        }

        // Add new relations
        if (toAdd.length > 0) {
          const files = await this.fileService.getFileByIds(toAdd, manager);

          if (!files || files.length !== toAdd.length) {
            throw new NotFoundException('Some files not found');
          }

          await this.fileService.usedAtUpdate(toAdd, manager);

          const payload = toAdd.map((fileId) => ({
            [relationConfig.fkField]: id,
            fileId,
          }));

          const newRelations = manager.create(relationConfig.entity, payload);

          await manager.save(relationConfig.entity, newRelations);
        }
      }

      // Return updated product with files
      return await manager.findOne(repo.target, {
        where: { id },
        relations: relationConfig
          ? ['fileRelations', 'fileRelations.file']
          : [],
      });
    });
  }

  async productSoftDelete(softDeleteDto: ProductSoftDeleteDto) {
    const { id, type } = softDeleteDto;

    const categoryEnum = type as Categories;
    const repo = this.productRepoMap[categoryEnum];

    if (!repo) {
      throw new BadRequestException(`Invalid category type: ${type}`);
    }

    const repoInstance = this.dataSource.getRepository(repo.target);

    // Load existing product
    const product = await repoInstance.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.dataSource.transaction(async (manager) => {
      const newStatus = !product.isDeleted; // toggle

      await manager.update(repo.target, { id }, { isDeleted: newStatus });
    });

    return await this.getSingleProductByIdAndType(id, type);
  }
}
