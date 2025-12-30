import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CategoryEntity } from 'src/entities/product';
import { CategoryCreateDto, CategoryUpdateDto } from '../dto';
import { Categories } from 'src/common/enums';
import { FileService } from 'src/modules/file/file.service';
import { CategoryFileRelationEntity } from 'src/entities/product/category.file.reation.entity';
import { SubCategoryService } from './sub.category.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    private readonly fileService: FileService,
    private readonly dataSource: DataSource,
    private readonly subCategoryService: SubCategoryService,
  ) {}

  // ------------------------------------------------------------
  // Create
  // ------------------------------------------------------------
  async createCategory(
    createCategoryDto: CategoryCreateDto,
  ): Promise<CategoryEntity> {
    const { fileIds, subCategoryNames, ...categoryData } = createCategoryDto;

    // 1️⃣ Validate files before transaction
    const files = await this.fileService.getFileByIds(fileIds);

    if (!files || files.length !== fileIds.length) {
      throw new NotFoundException('Files are not found');
    }

    return this.dataSource.transaction(async (manager) => {
      // 2️⃣ Create category
      const category = await manager.save(CategoryEntity, categoryData);

      // 3️⃣ Update usedAt for files
      await this.fileService.usedAtUpdate(fileIds, manager);

      // 4️⃣ Create category-file relations (payload first)
      const relationsPayload = fileIds.map((fileId) => ({
        categoryId: category.id,
        fileId,
      }));

      await manager.save(
        CategoryFileRelationEntity,
        manager.create(CategoryFileRelationEntity, relationsPayload),
      );

      // 5️⃣ Optional: bulk create sub-categories
      if (subCategoryNames?.length) {
        await this.subCategoryService.bulkSubCategoryCreate(
          category.id,
          subCategoryNames,
          manager,
        );
      }

      return category;
    });
  }

  // ------------------------------------------------------------
  // Find All
  // ------------------------------------------------------------
  // async findAllCategories(): Promise<CategoryEntity[]> {
  //   return this.categoryRepository.find();
  // }

  async findAllCategories(page = 1, limit = 10) {
    const take = Math.min(Math.max(limit, 1), 100); // safety cap
    const skip = (Math.max(page, 1) - 1) * take;

    const qb = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.categoryFiles', 'categoryFile')
      .leftJoinAndSelect('categoryFile.file', 'file')
      .leftJoinAndSelect('category.subCategories', 'subCategory')
      .select([
        'category.id',
        'category.categoryName',
        'category.description',

        'categoryFile.id',

        'file.id',
        'file.url',
        'file.mimeType',

        'subCategory.id',
        'subCategory.subCategoryName',
      ])
      .where('category.isDeleted = false')
      .skip(skip)
      .take(take);

    const [categories, total] = await qb.getManyAndCount();

    return {
      meta: {
        total,
        page,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
      categories,
    };
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
      .andWhere('category.isDeleted = false')
      .getOne();

    return category || null;
  }

  async getAllCategoriesNameAndDescription() {
    return await this.categoryRepository
      .createQueryBuilder('category')
      .select(['category.id', 'category.categoryName', 'category.description'])
      .andWhere('category.isDeleted = false')
      .getMany();
  }

  async categoryUpdate(categoryDto: CategoryUpdateDto) {
    const { id, fileIds, categoryName, description } = categoryDto;

    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['categoryFiles'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (fileIds?.length) {
      const files = await this.fileService.getFileByIds(fileIds);

      if (files.length !== fileIds.length) {
        throw new NotFoundException('One or more files not found');
      }
    }

    return await this.dataSource.transaction(async (manager) => {
      // -------------------------
      // A) Update category fields
      // -------------------------
      if (categoryName || description) {
        await manager.update(
          CategoryEntity,
          { id },
          {
            ...(categoryName && { categoryName }),
            ...(description && { description }),
          },
        );
      }

      // -------------------------
      // B) Replace file relations
      // -------------------------
      if (fileIds?.length) {
        // 1️⃣ Remove old relations ONLY
        await manager.delete(CategoryFileRelationEntity, {
          categoryId: id,
        });

        // 2️⃣ Create new relations
        const relations = fileIds.map((fileId) => ({
          categoryId: id,
          fileId,
        }));

        await manager.insert(CategoryFileRelationEntity, relations);

        // 3️⃣ Mark files as used (DO NOT DELETE)
        await this.fileService.usedAtUpdate(fileIds, manager);
      }

      // -------------------------
      // C) Return updated entity
      // -------------------------
      return manager.findOne(CategoryEntity, {
        where: { id },
        relations: ['categoryFiles', 'categoryFiles.file'],
      });
    });
  }

  async categorySoftDelete(id: string) {
    // 1️⃣ Check if category exists
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // 2️⃣ Soft delete by setting isDeleted to true
    category.isDeleted = true;
    await this.categoryRepository.save(category);
    return { message: 'Category soft deleted successfully' };
  }
}
