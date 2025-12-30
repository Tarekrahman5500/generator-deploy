import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { BackgroundEntity } from 'src/entities/background/background.entity';
import { FileEntity } from 'src/entities/file/file.entity';
import { FileService } from 'src/modules/file/file.service';
import { BackgroundBulkCreateDto, BackgroundUpdateDto } from './dto';

@Injectable()
export class BackgroundService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(BackgroundEntity)
    private readonly backgroundRepo: Repository<BackgroundEntity>,

    @InjectRepository(FileEntity)
    private readonly fileRepo: Repository<FileEntity>,

    private readonly fileService: FileService,
  ) {}

  // =========================
  // 1️⃣ BULK CREATE
  // =========================
  async bulkCreate(dto: BackgroundBulkCreateDto): Promise<BackgroundEntity[]> {
    const fileIds = dto.items.map((i) => i.fileId).filter(Boolean) as string[];

    // 1️⃣ Validate files before transaction
    if (fileIds.length) {
      const files = await this.fileRepo.find({
        where: { id: In(fileIds) },
      });

      if (files.length !== fileIds.length) {
        throw new NotFoundException('One or more files not found');
      }
    }

    const files = fileIds.length
      ? await this.fileService.getFileByIds(fileIds)
      : [];

    const fileMap = new Map(files.map((f) => [f.id, f]));

    return this.dataSource.transaction(async (manager) => {
      // 3️⃣ Create payload
      const payload = dto.items.map((item) =>
        manager.create(BackgroundEntity, {
          section: item.section,
          title: item.title,
          description: item.description,
          isVisible: item.isVisible ?? true,
          file: item.fileId ? (fileMap.get(item.fileId) ?? null) : null,
        }),
      );

      // 4️⃣ Update file usedAt (only once)
      if (fileIds.length) {
        await this.fileService.usedAtUpdate(fileIds, manager);
      }

      // 5️⃣ Bulk save
      return manager.save(BackgroundEntity, payload);
    });
  }

  // =========================
  // 2️⃣ GET ALL (GROUP BY SECTION)
  // =========================
  async getAllGroupedBySection() {
    const items = await this.backgroundRepo.find({
      where: { isVisible: true },
      relations: ['file'],
      order: { createdAt: 'ASC' },
    });

    const grouped: Record<string, BackgroundEntity[]> = {};

    for (const item of items) {
      if (!grouped[item.section]) {
        grouped[item.section] = [];
      }
      grouped[item.section].push(item);
    }

    return grouped;
  }

  // =========================
  // 3️⃣ GET SINGLE BY ID
  // =========================
  async getById(id: string): Promise<BackgroundEntity> {
    const background = await this.backgroundRepo.findOne({
      where: { id },
      relations: ['file'],
    });

    if (!background) {
      throw new NotFoundException('Background info not found');
    }

    return background;
  }

  // =========================
  // 4️⃣ SINGLE UPDATE
  // =========================
  async update(
    id: string,
    dto: BackgroundUpdateDto,
  ): Promise<BackgroundEntity> {
    const background = await this.backgroundRepo.findOne({
      where: { id },
      relations: ['file'],
    });

    if (!background) {
      throw new NotFoundException('Background info not found');
    }

    // Validate file (if changed)
    if (dto.fileId) {
      const file = await this.fileRepo.findOne({
        where: { id: dto.fileId },
      });

      if (!file) {
        throw new NotFoundException('File not found');
      }

      background.file = file;
    }

    Object.assign(background, {
      section: dto.section ?? background.section,
      title: dto.title ?? background.title,
      description: dto.description ?? background.description,
      isVisible: dto.isVisible ?? background.isVisible,
    });

    return this.dataSource.transaction(async (manager) => {
      if (dto.fileId) {
        await this.fileService.usedAtUpdate([dto.fileId], manager);
      }

      return manager.save(BackgroundEntity, background);
    });
  }

  // =========================
  // 5️⃣ TOGGLE VISIBILITY
  // =========================
  async toggleVisibility(id: string): Promise<BackgroundEntity> {
    const background = await this.backgroundRepo.findOne({
      where: { id },
    });

    if (!background) {
      throw new NotFoundException('Background info not found');
    }

    background.isVisible = !background.isVisible;
    return this.backgroundRepo.save(background);
  }

  // =========================
  // 6️⃣ SINGLE DELETE
  // =========================
  async delete(id: string): Promise<{ id: string; deleted: true }> {
    const background = await this.backgroundRepo.findOne({
      where: { id },
    });

    if (!background) {
      throw new NotFoundException('Background info not found');
    }

    await this.backgroundRepo.delete(id);

    return {
      id,
      deleted: true,
    };
  }
}
