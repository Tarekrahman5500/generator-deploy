import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, IsNull, Repository } from 'typeorm';
import { FileEntity } from 'src/entities/file';
import { UploadFileResponseDto } from './dto';
import { join } from 'path';
import * as fs from 'node:fs/promises';
import * as xlsx from 'xlsx';
import * as path from 'node:path';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepo: Repository<FileEntity>,
  ) {}

  async saveFileInfo(
    file: Express.Multer.File,
    language?: string,
  ): Promise<UploadFileResponseDto> {
    const fileEntity = this.fileRepo.create({
      fileName: file.filename,
      originalName: file.originalname,
      language: language,
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
    if (ids.length === 0) return [];
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
        console.warn(`⚠ Warning: Failed to delete file from disk: ${filePath}`);
      }
    }
  }

  async deleteFileById(id: string): Promise<void> {
    const ids: string[] = [];
    ids.push(id);
    return await this.deleteFilesByIds(ids);
  }

  execlExtractData(buffer: Buffer) {
    const workbook = xlsx.read(buffer, { type: 'buffer' });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = xlsx.utils.sheet_to_json<Record<string, any>>(sheet, {
      defval: null,
      raw: false,
    });

    // 🔹 Skip first 5 data rows (not header)
    return rows.slice(0, 3);
  }

  async getFileBuffer(file: { url: string }): Promise<Buffer> {
    if (!file?.url) {
      throw new Error('File URL not found');
    }

    const filePath = path.resolve(process.cwd(), file.url);
    return await fs.readFile(filePath);
  }
}
