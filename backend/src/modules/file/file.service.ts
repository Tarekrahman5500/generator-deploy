import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, IsNull, Repository } from 'typeorm';
import { FileEntity } from 'src/entities/file';
import { UploadFileResponseDto } from './dto';
import { join } from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepo: Repository<FileEntity>,
  ) {}

  async saveFileInfo(
    file: Express.Multer.File,
  ): Promise<UploadFileResponseDto> {
    const fileEntity = this.fileRepo.create({
      fileName: file.filename,
      originalName: file.originalname,
      url: `uploads/${file.filename}`,
      mimeType: file.mimetype,
      size: file.size,
    });

    return await this.fileRepo.save(fileEntity);
  }

  async findById(id: string): Promise<FileEntity | null> {
    return this.fileRepo.findOne({ where: { id } });
  }

  async getFileByIds(
    ids: string[],
    manager?: EntityManager,
  ): Promise<FileEntity[]> {
    const repo = manager ? manager.getRepository(FileEntity) : this.fileRepo;

    return repo.find({
      where: { id: In(ids), usedAt: IsNull() },
    });
  }

  async usedAtUpdate(ids: string[], manager?: EntityManager): Promise<void> {
    const repo = manager ? manager.getRepository(FileEntity) : this.fileRepo;

    await repo.update(ids, {
      usedAt: new Date(),
    });
  }

  async getAllFiles(): Promise<FileEntity[]> {
    return this.fileRepo.find();
  }

  async deleteFilesByIds(
    fileIds: string[],
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager ? manager.getRepository(FileEntity) : this.fileRepo;

    // 1️⃣ Load all files
    const files = await repo.find({
      where: { id: In(fileIds) },
    });

    if (!files || files.length !== fileIds.length) {
      throw new NotFoundException('One or more files not found');
    }

    // 2️⃣ Delete DB records
    await repo.delete(fileIds);

    // 3️⃣ Delete physical files
    for (const file of files) {
      const filePath = join(process.cwd(), file.url);

      try {
        await fs.unlink(filePath);
      } catch {
        console.warn(
          `⚠ Warning: Failed to delete file from disk: ${filePath}`,
        );
      }
    }
  }

  async deleteFileById(id: string): Promise<void> {
    const ids: string[] = [];
    ids.push(id);
    return await this.deleteFilesByIds(ids);
  }
}
