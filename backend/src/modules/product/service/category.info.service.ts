import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CategoryInfoEntity } from 'src/entities/product';
import { CategoryInfoCreateDto, CategoryInfoDto } from '../dto';
import { FileService } from 'src/modules/file/file.service';
import { CategoryInfoFileRelationEntity } from 'src/entities/product/category.info.file.relation.entity';

@Injectable()
export class CategoryInfoService {
  constructor(
    @InjectRepository(CategoryInfoEntity)
    private readonly categoryInfoRepository: Repository<CategoryInfoEntity>,
    private readonly fileService: FileService,
    private readonly dataSource: DataSource,
  ) {}

  async createCategoryInfo(
    dto: CategoryInfoCreateDto,
  ): Promise<CategoryInfoDto> {
    const { fileIds, ...categoryInfoData } = dto;

    return await this.dataSource.transaction(async (manager) => {
      // 1️⃣ Create category info
      const categoryInfo = await manager.save(
        CategoryInfoEntity,
        categoryInfoData,
      );

      if (fileIds && fileIds.length > 0) {
        // 2️⃣ Check existing files
        const files = await this.fileService.getFileByIds(fileIds, manager);

        if (!files || files.length !== fileIds.length) {
          throw new NotFoundException('Files are not found');
        }

        // 3️⃣ Update usedAt for files
        await this.fileService.usedAtUpdate(fileIds, manager);

        // 4️⃣ Create category-info-file relations
        const relations = fileIds.map((fileId) =>
          manager.create(CategoryInfoFileRelationEntity, {
            categoryInfoId: categoryInfo.id,
            fileId,
          }),
        );

        await manager.save(CategoryInfoFileRelationEntity, relations);
      }

      return {
        ...categoryInfo,
        fileIds: fileIds || [],
      };
    });
  }

  async findAllCategoryInfo(): Promise<CategoryInfoDto[]> {
    const categories = await this.categoryInfoRepository.find({
      relations: ['category', 'categoryInfoFiles', 'categoryInfoFiles.file'],
    });

    return categories.map((cat) => ({
      ...cat,
      fileIds: cat.categoryInfoFiles?.map((f) => f.fileId) || [],
    }));
  }

  async findByTitleAndDescription(
    title: string,
    description: string,
  ): Promise<CategoryInfoDto | null> {
    const category = await this.categoryInfoRepository.findOne({
      where: { title, description },
      relations: ['categoryInfoFiles', 'categoryInfoFiles.file'],
    });

    if (!category) return null;

    return {
      ...category,
      fileIds: category.categoryInfoFiles?.map((f) => f.fileId) || [],
    };
  }
}
