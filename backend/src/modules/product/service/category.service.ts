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
          `Category with name ${categoryName} already exists`,
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
      // ...(serialNo !== undefined && { serialNo }),
    });

    // -------------------------
    // D) Transaction save
    // -------------------------
    return this.dataSource.transaction(async (manager) => {
      if (typeof serialNo === 'number' && serialNo !== category.serialNo) {
        const oldSerial = category.serialNo;
        const newSerial = serialNo;

        const tempSerial = -1; // must not exist in table

        // Step 1: set current category to temp
        category.serialNo = tempSerial;
        await manager.save(CategoryEntity, category);

        // Step 2: shift conflicting categories
        if (newSerial < oldSerial) {
          // Moving up: Shift others higher. Update in DESC order.
          await manager
            .createQueryBuilder()
            .update(CategoryEntity)
            .set({ serialNo: () => 'serial_no + 1' })
            .where('serial_no >= :newSerial AND serial_no < :oldSerial', {
              newSerial,
              oldSerial,
            })
            .orderBy('serial_no', 'DESC') // <--- Critical: Move the highest ones first
            .execute();
        } else {
          // Moving down: Shift others lower. Update in ASC order.
          await manager
            .createQueryBuilder()
            .update(CategoryEntity)
            .set({ serialNo: () => 'serial_no - 1' })
            .where('serial_no <= :newSerial AND serial_no > :oldSerial', {
              newSerial,
              oldSerial,
            })
            .orderBy('serial_no', 'ASC') // <--- Critical: Move the lowest ones first
            .execute();
        }

        // Step 3: assign new serialNo to category
        category.serialNo = newSerial;
      }

      // console.log(category);

      if (shouldUpdateFiles && fileIds?.length) {
        await this.fileService.usedAtUpdate(fileIds, manager);
      }

      return manager.save(CategoryEntity, category);
    });
  }

  async createCategory(dto: CategoryCreateDto): Promise<CategoryEntity> {
    const { categoryName, description, fileIds, subCategoryNames, serialNo } =
      dto;

    // 1. Pre-transaction checks (Optional but good for performance)
    const exists = await this.dataSource.manager.findOne(CategoryEntity, {
      where: { categoryName },
    });
    if (exists) {
      throw new ConflictException(
        `Category with name ${categoryName} already exists`,
      );
    }

    // Validate files
    const files = await this.fileService.getFileByIds(fileIds);
    if (!files || files.length !== fileIds.length) {
      throw new NotFoundException('At least one file is required');
    }

    return this.dataSource.transaction(
      async (manager): Promise<CategoryEntity> => {
        // -------------------------
        // SERIAL HANDLING
        // -------------------------
        let finalSerial: number;

        if (serialNo !== undefined && serialNo !== null) {
          // Check if the requested serial already exists
          const serialExists = await manager
            .createQueryBuilder(CategoryEntity, 'c')
            .where('c.serial_no = :serialNo', { serialNo })
            .getExists();

          if (serialExists) {
            // SHIFT LOGIC:
            // We add .orderBy('serial_no', 'DESC') so that the highest numbers
            // are incremented first, avoiding the Unique Constraint error.
            await manager
              .createQueryBuilder()
              .update(CategoryEntity)
              .set({ serialNo: () => 'serial_no + 1' })
              .where('serial_no >= :serialNo', { serialNo })
              .orderBy('serial_no', 'DESC') // <--- CRITICAL FIX
              .execute();
          }
          finalSerial = serialNo;
        } else {
          // If no serial provided, get MAX + 1
          const maxSerialObj = await manager
            .createQueryBuilder(CategoryEntity, 'c')
            .select('MAX(c.serial_no)', 'max')
            .getRawOne<{ max: number | null }>();

          finalSerial = (maxSerialObj?.max ?? 0) + 1;
        }

        // -------------------------
        // CREATE CATEGORY
        // -------------------------
        const category = manager.create(CategoryEntity, {
          categoryName,
          description,
          serialNo: finalSerial,
        });

        // Save the category first to get the ID
        const savedCategory = await manager.save(CategoryEntity, category);

        // -------------------------
        // CATEGORY FILE RELATIONS
        // -------------------------
        if (fileIds?.length) {
          await this.fileService.usedAtUpdate(fileIds, manager);

          const relationsPayload = fileIds.map((fileId) => ({
            categoryId: savedCategory.id,
            fileId,
          }));

          // Use manager.insert or save for relations
          await manager.insert(CategoryFileRelationEntity, relationsPayload);
        }

        // -------------------------
        // SUBCATEGORIES
        // -------------------------
        if (subCategoryNames?.length) {
          await this.subCategoryService.bulkSubCategoryCreate(
            savedCategory.id,
            subCategoryNames,
            manager,
          );
        }

        return savedCategory;
      },
    );
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
      .orderBy('category.serialNo', 'ASC')
      .getMany();
  }

  async categorySoftDelete(id: string) {
    // 1. Find the category to get its current serialNo
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const deletedSerial = category.serialNo;

    // 2. Execute deletion and shifting in a transaction
    await this.dataSource.transaction(async (manager) => {
      // A. Delete the category
      // If you actually want Soft Delete, change this to:
      // await manager.update(CategoryEntity, id, { isDeleted: true, serialNo: 0 });
      await manager.delete(CategoryEntity, { id });

      // B. Reshift: Decrement all categories that had a higher serialNo
      // UPDATE categories SET serialNo = serialNo - 1 WHERE serialNo > deletedSerial
      await manager
        .createQueryBuilder()
        .update(CategoryEntity)
        .set({ serialNo: () => 'serial_no - 1' })
        .where('serial_no > :deletedSerial', { deletedSerial })
        // CRITICAL: When subtracting, update from lowest to highest
        .orderBy('serial_no', 'ASC')
        .execute();
    });

    return {
      message: 'Category deleted and serial numbers reshuffled successfully',
    };
  }
}
