import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity, SubCategoryEntity } from 'src/entities/product';
import { Repository, In, EntityManager } from 'typeorm';

@Injectable()
export class SubCategoryService {
  constructor(
    @InjectRepository(SubCategoryEntity)
    private readonly subCategoryRepo: Repository<SubCategoryEntity>,

    @InjectRepository(CategoryEntity)
    private readonly categoryRepo: Repository<CategoryEntity>,
  ) {}

  // =========================
  // 1️⃣ BULK CREATE
  // =========================
  async bulkSubCategoryCreate(
    categoryId: string,
    subCategoryNames: string[],
    manager?: EntityManager,
  ): Promise<SubCategoryEntity[]> {
    if (!subCategoryNames.length) {
      throw new BadRequestException('Sub-category list cannot be empty');
    }

    const categoryRepo = manager
      ? manager.getRepository(CategoryEntity)
      : this.categoryRepo;

    const subCategoryRepo = manager
      ? manager.getRepository(SubCategoryEntity)
      : this.subCategoryRepo;

    // 1️⃣ Validate category
    const category = await categoryRepo.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // 2️⃣ Prepare unique payload
    const uniqueNames = [...new Set(subCategoryNames)];

    const payload = uniqueNames.map((name) => ({
      subCategoryName: name,
      category,
    }));

    // 3️⃣ Find already existing sub-categories
    const existing = await subCategoryRepo.find({
      where: {
        category: { id: categoryId },
        subCategoryName: In(uniqueNames),
      },
    });

    const existingNames = new Set(existing.map((s) => s.subCategoryName));

    // 4️⃣ Filter payload (only new ones)
    const insertPayload = payload.filter(
      (p) => !existingNames.has(p.subCategoryName),
    );

    if (!insertPayload.length) {
      return [];
    }

    // 5️⃣ Bulk insert
    return subCategoryRepo.save(subCategoryRepo.create(insertPayload));
  }

  // =========================
  // 2️⃣ SINGLE GET
  // =========================
  async getSubCategoryById(id: string): Promise<SubCategoryEntity> {
    const subCategory = await this.subCategoryRepo.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!subCategory) {
      throw new NotFoundException('Sub-category not found');
    }

    return subCategory;
  }

  // =========================
  // 3️⃣ SINGLE UPDATE
  // =========================
  async updateSubCategory(
    id: string,
    subCategoryName: string,
  ): Promise<SubCategoryEntity> {
    const subCategory = await this.subCategoryRepo.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!subCategory) {
      throw new NotFoundException('Sub-category not found');
    }

    // Prevent duplicate name inside same category
    const exists = await this.subCategoryRepo.findOne({
      where: {
        subCategoryName,
        category: { id: subCategory.category.id },
      },
    });

    if (exists && exists.id !== id) {
      throw new BadRequestException(
        'Sub-category name already exists in this category',
      );
    }

    subCategory.subCategoryName = subCategoryName;
    return this.subCategoryRepo.save(subCategory);
  }

  // =========================
  // 4️⃣ SINGLE DELETE
  // =========================
  async deleteSubCategory(id: string): Promise<{ id: string; deleted: true }> {
    const subCategory = await this.subCategoryRepo.findOne({
      where: { id },
    });

    if (!subCategory) {
      throw new NotFoundException('Sub-category not found');
    }

    await this.subCategoryRepo.delete(id);

    return {
      id,
      deleted: true,
    };
  }
}
