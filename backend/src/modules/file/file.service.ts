import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, IsNull, Repository } from 'typeorm';
import { FileEntity } from 'src/entities/file';
import { FileIdParamDto, UploadFileResponseDto } from './dto';
import { join } from 'path';
import * as fs from 'node:fs/promises';
import * as xlsx from 'xlsx';
import * as path from 'node:path';
import { ProductFileRelationEntity } from 'src/entities/product';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepo: Repository<FileEntity>,

    @InjectRepository(ProductFileRelationEntity)
    private readonly productFileRelationRepo: Repository<ProductFileRelationEntity>,
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

  async deleteFileById(params: FileIdParamDto): Promise<void> {
    const { id, productId } = params;

    if (productId) {
      await this.productFileRelationRepo.delete({
        file: { id: id },
        product: { id: productId },
      });
    } else {
      return await this.deleteFilesByIds([id]);
    }
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
    // return rows.slice(0, 3);
    return rows;
  }

  async getFileBuffer(file: { url: string }): Promise<Buffer> {
    if (!file?.url) {
      throw new Error('File URL not found');
    }

    const filePath = path.resolve(process.cwd(), file.url);
    return await fs.readFile(filePath);
  }

  async getSmartFileSelection(fileIds: string[]): Promise<string[]> {
    if (!fileIds.length) return [];

    // 1. Fetch all files from the list, ordered by newest first
    const files = await this.fileRepo
      .createQueryBuilder('file')
      .where('file.id IN (:...fileIds)', { fileIds })
      .andWhere('file.usedAt IS NULL')
      .orderBy('file.createdAt', 'DESC')
      .getMany();

    const finalFileIds: string[] = [];
    const seenPdfLanguages = new Set<string>();

    for (const file of files) {
      if (file.mimeType === 'application/pdf') {
        // PDF LOGIC: Only add if we haven't seen this language yet (newest first)
        if (file.language && !seenPdfLanguages.has(file.language)) {
          seenPdfLanguages.add(file.language);
          finalFileIds.push(file.id);
        } else if (!file.language) {
          // If PDF has no language, we usually keep it or apply same logic to "null"
          finalFileIds.push(file.id);
        }
      } else {
        // NON-PDF LOGIC: Keep all images, gifs, etc.
        finalFileIds.push(file.id);
      }
    }

    return finalFileIds;
  }
}
