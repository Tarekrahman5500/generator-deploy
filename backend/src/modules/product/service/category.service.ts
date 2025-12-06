import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  AutomaticTransferSwitchEntity,
  CategoryEntity,
  CompressorEntity,
  DieselGeneratorSetEnitiy,
  DistributorPanelEntity,
  ForkliftEntity,
  TowerLightEntity,
  UpsEntity,
} from 'src/entities/product';
import { CategoryCreateDto, CategoryUpdateDto } from '../dto';
import { Categories } from 'src/common/enums';
import { FileService } from 'src/modules/file/file.service';
import { CategoryFileRelationEntity } from 'src/entities/product/category.file.reation.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
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
  ) {}

  // ------------------------------------------------------------
  // Create
  // ------------------------------------------------------------
  async createCategory(
    createCategoryDto: CategoryCreateDto,
  ): Promise<CategoryEntity> {
    const { fileIds, ...categoryData } = createCategoryDto;

    // 2️⃣ Check existing files
    const files = await this.fileService.getFileByIds(fileIds);

    if (!files || files.length !== fileIds.length) {
      throw new NotFoundException('Files are not found');
    }

    return await this.dataSource.transaction(async (manager) => {
      // 1️⃣ Create category
      const category = await manager.save(CategoryEntity, categoryData);

      // 3️⃣ Update usedAt for files
      await this.fileService.usedAtUpdate(fileIds, manager);

      // 4️⃣ Create category-file relations
      const relationsPayload = fileIds.map((fileId) => ({
        categoryId: category.id,
        fileId,
      }));

      // Create entity objects
      const relations = manager.create(
        CategoryFileRelationEntity,
        relationsPayload,
      );

      await manager.save(CategoryFileRelationEntity, relations);

      return category;
    });
  }

  // ------------------------------------------------------------
  // Find All
  // ------------------------------------------------------------
  // async findAllCategories(): Promise<CategoryEntity[]> {
  //   return this.categoryRepository.find();
  // }

  async findAllCategories() {
    const categories = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.categoryFiles', 'categoryFile')
      .leftJoinAndSelect('categoryFile.file', 'file')
      .select([
        'category.id',
        'category.categoryName',
        'category.description',
        'categoryFile.id',
        'file.id',
        'file.url',
        'file.mimeType',
      ])
      .getMany();

    for (const category of categories) {
      const categoryId = category.id;

      const [
        compressors,
        dieselGenerators,
        forklifts,
        towerLights,
        ups,
        ats,
        distributorPanels,
      ] = await Promise.all([
        this.compressorRepo.find({
          where: { categoryId },
          order: { createdAt: 'DESC' },
          take: 2,
          relations: ['fileRelations', 'fileRelations.file'],
        }),
        this.dieselRepo.find({
          where: { categoryId },
          order: { createdAt: 'DESC' },
          take: 2,
          relations: ['fileRelations', 'fileRelations.file'],
        }),
        this.forkliftRepo.find({
          where: { categoryId },
          order: { createdAt: 'DESC' },
          take: 2,
          relations: ['fileRelations', 'fileRelations.file'],
        }),
        this.towerLightRepo.find({
          where: { categoryId },
          order: { createdAt: 'DESC' },
          take: 2,
          relations: ['fileRelations', 'fileRelations.file'],
        }),
        this.upsRepo.find({
          where: { categoryId },
          order: { createdAt: 'DESC' },
          take: 2,
          relations: ['fileRelations', 'fileRelations.file'],
        }),
        this.atsRepo.find({
          where: { categoryId },
          order: { createdAt: 'DESC' },
          take: 2,
          relations: ['fileRelations', 'fileRelations.file'],
        }),
        this.distributorPanelRepo.find({
          where: { categoryId },
          order: { createdAt: 'DESC' },
          take: 2,
          relations: ['fileRelations', 'fileRelations.file'],
        }),
      ]);

      // Build only non-empty product groups
      const productData: Record<string, any[]> = {};

      if (compressors.length > 0) productData.compressors = compressors;
      if (dieselGenerators.length > 0)
        productData.dieselGenerators = dieselGenerators;
      if (forklifts.length > 0) productData.forklifts = forklifts;
      if (towerLights.length > 0) productData.towerLights = towerLights;
      if (ups.length > 0) productData.ups = ups;
      if (ats.length > 0) productData.ats = ats;
      if (distributorPanels.length > 0)
        productData.distributorPanels = distributorPanels;

      // Assign only if something exists
      if (Object.keys(productData).length > 0) {
        category.products = productData;
      }
    }

    return categories;
  }

  // ------------------------------------------------------------
  // Find by Name
  // ------------------------------------------------------------
  async findByName(name: Categories): Promise<CategoryEntity | null> {
    return await this.categoryRepository.findOne({
      where: { categoryName: name },
    });
  }

  // ------------------------------------------------------------
  // Find by ID
  // ------------------------------------------------------------
  async findCategoryById(id: string): Promise<CategoryEntity | null> {
    // Use QueryBuilder to select category + categoryFiles + file
    const category = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.categoryFiles', 'categoryFile')
      .leftJoinAndSelect('categoryFile.file', 'file')
      .select([
        'category.id',
        'category.categoryName',
        'category.description',
        'categoryFile.id',
        'file.id',
        'file.url',
        'file.mimeType',
      ])
      .where('category.id = :id', { id })
      .getOne();

    return category || null;
  }

  async getAllCategoriesNameAndDescription() {
    return await this.categoryRepository
      .createQueryBuilder('category')
      .select(['category.id', 'category.categoryName', 'category.description'])
      .getMany();
  }

  async categoryUpdate(categoryDto: CategoryUpdateDto) {
    const { id, fileIds, description } = categoryDto;

    // 1️⃣ Check if category exists
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['categoryFiles'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // 2️⃣ Validate fileIds if provided
    if (fileIds) {
      const files = await this.fileService.getFileByIds(fileIds);

      if (!files || files.length !== fileIds.length) {
        throw new NotFoundException('Files are already used or not found');
      }
    }

    // 3️⃣ Run whole update inside a Transaction
    return await this.dataSource.transaction(async (manager) => {
      // ------------------------------------------
      // A) Update category data (if provided)
      // ------------------------------------------
      if (description) {
        await manager.update(CategoryEntity, { id }, { description });
      }

      // ------------------------------------------
      // B) If fileIds provided, replace old relations
      // ------------------------------------------
      if (fileIds) {
        // 1️⃣ Mark files as used
        await this.fileService.usedAtUpdate(fileIds, manager);

        await this.fileService.deleteFilesByIds(fileIds, manager);
        // 2️⃣ Remove existing relations
        await manager.delete(CategoryFileRelationEntity, {
          categoryId: id,
        });

        // 3️⃣ Create new relations payload
        const relationsPayload = fileIds.map((fileId) => ({
          categoryId: id,
          fileId,
        }));

        // 4️⃣ Insert new relations
        const newRelations = manager.create(
          CategoryFileRelationEntity,
          relationsPayload,
        );

        await manager.save(CategoryFileRelationEntity, newRelations);
      }

      // ------------------------------------------
      // C) Return updated category with files
      // ------------------------------------------
      const updatedCategory = await manager.findOne(CategoryEntity, {
        where: { id },
        relations: ['categoryFiles', 'categoryFiles.file'],
      });

      return updatedCategory;
    });
  }
}
