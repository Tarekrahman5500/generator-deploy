import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ProductEntity,
  FieldEntity,
  ProductValueEntity,
  ProductFileRelationEntity,
} from 'src/entities/product';
import { DataSource, Repository } from 'typeorm';
import { FileService } from 'src/modules/file/file.service';
import { GroupService } from './group.service';
import { CreateProductDto } from '../dto';
import { ProductFieldHelperService } from './product-field.helper.service';

interface RowError {
  row: number;
  error: string;
}

@Injectable()
export class BulkProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(FieldEntity)
    private readonly fieldRepository: Repository<FieldEntity>,
    private readonly fileService: FileService,
    private readonly groupService: GroupService,
    private readonly dataSource: DataSource,
    private readonly productFieldHelperService: ProductFieldHelperService,
  ) {}

  async productCreateByExecl(
    categoryId: string,
    excelFileId: string,
    imageFileId: string,
  ) {
    // 1. Fetch File and Category Groups
    const [file] = await this.fileService.getFileByIds([excelFileId]);
    if (!file) throw new NotFoundException('Excel file not found');

    const groups = await this.groupService.findGroupsByCategoryId(categoryId);
    if (!groups.length) throw new NotFoundException('Category has no groups');

    const buffer = await this.fileService.getFileBuffer(file);
    const rows = this.fileService.execlExtractData(buffer);
    if (!rows.length) throw new BadRequestException('Excel file is empty');

    // 2. SYNC FIELD SERIAL NUMBERS (The "Swap"/Update Logic)
    // We take the headers from the first row to determine the new order
    const headers = Object.keys(rows[0]);
    await this.syncFieldOrder(groups, headers);

    // 3. PREPARE DATA MAPS
    const fieldMap = this.createFieldMap(groups);
    const normalize = (str: string) =>
      str
        .toLowerCase()
        .replace(/[\s_-]/g, '')
        .trim();

    // 4. CHUNK PROCESSING (10 Batches for 300 Products)
    const CHUNK_SIZE = 30;
    const results: {
      success: number;
      failed: number;
      errors: RowError[];
      missingModel: string[];
    } = {
      success: 0,
      failed: 0,
      errors: [],
      missingModel: [],
    };

    let productIds: null | string[] = null;
    // Inside productCreateByExecl

    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);

      for (const [index, row] of chunk.entries()) {
        // Capture model name safely before the try block starts
        const currentModelName = String(
          row['Model'] || row['model'] || 'Unknown Model',
        );

        try {
          const payload = this.mapRowToDto(
            row,
            categoryId,
            imageFileId,
            fieldMap,
            normalize,
          );

          const existingFieldIds = await this.createProductInTransaction(
            payload,
            productIds,
          );
          productIds = existingFieldIds;
          results.success++;
        } catch (err) {
          results.failed++;
          results.missingModel.push(currentModelName);
          results.errors.push({
            row: i + index + 2,
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }
    }

    return results;
  }

  /**
   * UPDATES FIELD SERIAL NO BASED ON EXCEL COLUMN POSITION
   */
  private async syncFieldOrder(groups: any[], headers: string[]) {
    const normalize = (str: string) =>
      str
        .toLowerCase()
        .replace(/[\s_-]/g, '')
        .trim();

    await this.dataSource.transaction(async (manager) => {
      for (const group of groups) {
        // RESET counter for every new group
        let groupWiseCounter = 1;

        // 2. We must maintain the order found in the Excel file
        // Iterate through headers to see which ones belong to this group
        for (const header of headers) {
          const normalizedHeader = normalize(header);

          // Find the field in the current group that matches this header
          const matchingField = group.fields.find(
            (f) => normalize(f.fieldName) === normalizedHeader,
          );

          if (matchingField) {
            // Update the DB with the group-local serial number
            await manager.update(FieldEntity, matchingField.id, {
              serialNo: groupWiseCounter,
            });

            // Increment for the next field found in THIS group
            groupWiseCounter++;
          }
        }
      }
    });
  }

  /**
   * ATOMIC TRANSACTION PER PRODUCT
   */
  private async createProductInTransaction(
    dto: CreateProductDto,
    productIds: null | string[],
  ) {
    // console.log(dto);

    let existingFieldIds = productIds;
    return await this.dataSource.transaction(async (manager) => {
      // 1. Get MAX serial number specifically for THIS category
      // We add a pessimistic lock to prevent other concurrent uploads from picking the same number
      if (!existingFieldIds) {
        existingFieldIds =
          await this.productFieldHelperService.getFieldIdsByCategoryId(
            dto.categoryId,
            manager,
          );
      }

      const maxRes = await manager
        .createQueryBuilder(ProductEntity, 'p')
        .setLock('pessimistic_write')
        .select('MAX(p.serial_no)', 'max')
        .where('p.category_id = :categoryId', { categoryId: dto.categoryId })
        .getRawOne();

      const nextSerial = (Number(maxRes?.max) || 0) + 1;

      // 2. Create Product with category-specific serial
      const product = manager.create(ProductEntity, {
        modelName: dto.modelName,
        description: dto.description,
        serialNo: nextSerial,
        category: { id: dto.categoryId },
        // subCategory: dto.subCategoryId ? { id: dto.subCategoryId } : null,
      });

      const savedProduct = await manager.save(product);

      // 3. Bulk Insert Attributes
      if (dto.information.length) {
        const values = dto.information.map((info) => ({
          value: info.value,
          field: { id: info.fieldId },
          product: { id: savedProduct.id },
        }));
        await manager.insert(ProductValueEntity, values);
      }

      // 4. Attach Shared Image
      if (dto.fileIds && dto.fileIds.length) {
        const relations = dto.fileIds.map((fId) => ({
          product: { id: savedProduct.id },
          file: { id: fId },
        }));
        await manager.insert(ProductFileRelationEntity, relations);
        await this.fileService.usedAtUpdate(dto.fileIds, manager);
      }

      await this.productFieldHelperService.ensureProductValuesExist(
        [savedProduct.id],
        existingFieldIds,
        manager,
      );

      return existingFieldIds;
    });
  }

  private createFieldMap(groups: any[]) {
    const map = new Map<string, string>();
    const normalize = (str: string) =>
      str
        .toLowerCase()
        .replace(/[\s_-]/g, '')
        .trim();
    groups.forEach((g) =>
      g.fields.forEach((f) => map.set(normalize(f.fieldName), f.id)),
    );
    return map;
  }

  private mapRowToDto(
    row: any,
    categoryId: string,
    imageId: string,
    fieldMap: Map<string, string>,
    normalize: any,
  ): CreateProductDto {
    const information: { fieldId: string; value: string }[] = [];
    Object.entries(row).forEach(([key, value]) => {
      const fieldId = fieldMap.get(normalize(key));
      if (fieldId && value) {
        information.push({ fieldId, value: String(value) });
      }
    });

    return {
      categoryId,
      modelName: String(row['Model'] || row['model'] || 'Unknown'),
      description: String(row['Description'] || row['description'] || ''),
      information,
      fileIds: [imageId], // One image for all
    };
  }
}
