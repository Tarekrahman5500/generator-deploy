import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CategoryEntity } from 'src/entities/product';
import { CategoryCreateDto, CategoryUpdateDto } from '../dto';
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
    const { fileIds, subCategoryNames, categoryName, description, serialNo } =
      createCategoryDto;

    const exists = await this.categoryRepository.exists({
      where: { categoryName },
    });

    if (exists) {
      throw new ConflictException(
        `Category with name ${categoryName} already exists`,
      );
    }

    if (serialNo !== undefined && serialNo !== null) {
      const serialExists = await this.categoryRepository.exists({
        where: { serialNo },
      });

      if (serialExists) {
        throw new ConflictException(
          `Serial number ${serialNo} is already assigned to another category`,
        );
      }
    }
    // 1️⃣ Validate files before transaction
    const files = await this.fileService.getFileByIds(fileIds);

    if (!files || files.length !== fileIds.length) {
      throw new NotFoundException('Files are not found');
    }

    return this.dataSource.transaction(async (manager) => {
      // 2️⃣ Create category
      const category = await manager.save(CategoryEntity, {
        categoryName,
        description,
        serialNo,
      });

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

  async categoryUpdate(dto: CategoryUpdateDto): Promise<CategoryEntity> {
    const { id, categoryName, description, fileIds, serialNo } = dto;

    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['categoryFiles', 'categoryFiles.file'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // -------------------------
    // A) Unique categoryName check (only if changed)
    // -------------------------
    if (categoryName !== undefined && categoryName !== category.categoryName) {
      const exists = await this.categoryRepository.exists({
        where: { categoryName },
      });

      if (exists) {
        throw new ConflictException(
          `Category with name "${categoryName}" already exists`,
        );
      }
    }

    if (
      serialNo !== undefined &&
      serialNo !== null &&
      serialNo !== category.serialNo
    ) {
      const serialExists = await this.categoryRepository.exists({
        where: { serialNo },
      });

      if (serialExists) {
        throw new ConflictException(
          `Serial number ${serialNo} is already assigned to another category`,
        );
      }
    }
    // -------------------------
    // B) Handle fileIds (PATCH semantics)
    // -------------------------
    let shouldUpdateFiles = false;

    if (fileIds !== undefined) {
      const existingFileIds = category.categoryFiles.map((cf) => cf.fileId);

      const sameFiles =
        existingFileIds.length === fileIds.length &&
        existingFileIds.every((id) => fileIds.includes(id));

      if (!sameFiles) {
        const files = await this.fileService.getFileByIds(fileIds);

        if (files.length !== fileIds.length) {
          throw new NotFoundException('One or more files not found');
        }

        category.categoryFiles = fileIds.map((fileId) => {
          const relation = new CategoryFileRelationEntity();
          relation.categoryId = category.id;
          relation.fileId = fileId;
          return relation;
        });

        shouldUpdateFiles = true;
      }
    }

    // -------------------------
    // C) Partial scalar update
    // -------------------------
    Object.assign(category, {
      ...(categoryName !== undefined && { categoryName }),
      ...(description !== undefined && { description }),
      ...(serialNo !== undefined && { serialNo }),
    });

    // -------------------------
    // D) Transaction save
    // -------------------------
    return this.dataSource.transaction(async (manager) => {
      if (shouldUpdateFiles && fileIds?.length) {
        await this.fileService.usedAtUpdate(fileIds, manager);
      }

      return manager.save(CategoryEntity, category);
    });
  }

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
        'category.serialNo',
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
      categories: categories.sort((a, b) => {
        if (a.serialNo === null) return 1;
        if (b.serialNo === null) return -1;
        return a.serialNo - b.serialNo;
      }),
    };
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
        'category.serialNo',
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
      .select([
        'category.id',
        'category.serialNo',
        'category.categoryName',
        'category.description',
      ])
      .andWhere('category.isDeleted = false')
      .getMany();
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
