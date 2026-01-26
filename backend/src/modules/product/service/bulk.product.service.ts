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
import { DataSource, EntityManager, Repository } from 'typeorm';
import { FileService } from 'src/modules/file/file.service';
import { GroupService } from './group.service';
import { CreateProductDto } from '../dto';
import { ProductFieldHelperService } from './product-field.helper.service';
import { GroupEntity } from 'src/entities/product/group.entity';

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
    // 1) Fetch Excel file
    const [file] = await this.fileService.getFileByIds([excelFileId]);
    if (!file) throw new NotFoundException('Excel file not found');

    // 2️⃣ Check image field exists
    const imageField = await this.fileService.findById(imageFileId);

    if (!imageField) {
      throw new BadRequestException('Image field not found');
    }

    const buffer = await this.fileService.getFileBuffer(file);
    const rows = this.fileService.execlExtractData(buffer);
    if (!rows.length) throw new BadRequestException('Excel file is empty');

    const headers = Object.keys(rows[0] ?? {});
    const normalize = (str: string) =>
      String(str ?? '')
        .toLowerCase()
        .replace(/[\s_-]/g, '')
        .trim();

    //console.log(headers);

    // 2) CHUNK PROCESSING
    const CHUNK_SIZE = 30;
    const results: {
      success: number;
      failed: number;
      errors: RowError[];
      missingModel: string[];
    } = { success: 0, failed: 0, errors: [], missingModel: [] };

    // We’ll compute these once (cached) using first transaction
    let cachedFieldMap: Map<string, string> | null = null;
    let cachedFieldIds: string[] | null = null;

    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);

      for (const [index, row] of chunk.entries()) {
        const currentModelName = String(
          row['Model'] || row['model'] || row['MODEL'] || 'Unknown Model',
        );

        try {
          // Ensure fieldMap/fieldIds exists (only once, but inside a transaction-safe block)
          if (!cachedFieldMap || !cachedFieldIds) {
            await this.dataSource.transaction(async (manager) => {
              const { fieldMap, fieldIds } =
                await this.ensureFieldsForGeneralGroup(
                  categoryId,
                  headers,
                  manager,
                );

              cachedFieldMap = fieldMap;
              cachedFieldIds = fieldIds;
            });
          }

          const payload = this.mapRowToDto(
            row,
            categoryId,
            imageFileId,
            cachedFieldMap!,
            normalize,
          );

          await this.createProductInTransaction(
            payload,
            cachedFieldIds!, // <-- pass fieldIds, no need productIds caching anymore
          );

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
    fieldIds: string[],
  ) {
    return await this.dataSource.transaction(async (manager) => {
      // 1) Lock and get next serial for category
      const maxRes = await manager
        .createQueryBuilder(ProductEntity, 'p')
        .setLock('pessimistic_write')
        .select('MAX(p.serial_no)', 'max')
        .where('p.category_id = :categoryId', { categoryId: dto.categoryId })
        .getRawOne();

      const nextSerial = (Number(maxRes?.max) || 0) + 1;

      // 2) Create product
      const product = manager.create(ProductEntity, {
        modelName: dto.modelName,
        description: dto.description,
        serialNo: nextSerial,
        category: { id: dto.categoryId } as any,
      });

      const savedProduct = await manager.save(product);

      // 3) Insert provided attributes from Excel
      if (dto.information?.length) {
        const values = dto.information.map((info) => ({
          value: info.value ?? '',
          field: { id: info.fieldId } as any,
          product: { id: savedProduct.id } as any,
        }));

        await manager.insert(ProductValueEntity, values);
      }

      // 4) Attach image
      if (dto.fileIds?.length) {
        const relations = dto.fileIds.map((fId) => ({
          product: { id: savedProduct.id },
          file: { id: fId },
        }));
        await manager.insert(ProductFileRelationEntity, relations);
        await this.fileService.usedAtUpdate(dto.fileIds, manager);
      }

      // 5) Ensure empty values exist for missing fields
      await this.productFieldHelperService.ensureProductValuesExist(
        [savedProduct.id],
        fieldIds,
        manager,
      );

      return savedProduct;
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
      modelName: String(
        row['Model'] || row['model'] || row['MODEL'] || 'Unknown',
      ),
      description: String(row['Description'] || row['description'] || ''),
      information,
      fileIds: [imageId], // One image for all
    };
  }

  private normalizeKey(str: string) {
    return String(str ?? '')
      .toLowerCase()
      .replace(/[\s_-]/g, '')
      .trim();
  }

  private async ensureGeneralGroup(
    categoryId: string,
    manager: EntityManager,
  ): Promise<GroupEntity> {
    // Find existing General group in this category
    let general = await manager
      .getRepository(GroupEntity)
      .createQueryBuilder('g')
      .where('g.category_id = :categoryId', { categoryId })
      .andWhere('LOWER(g.groupName) = LOWER(:name)', { name: 'General' })
      .getOne();

    if (general) return general;

    // Create General with next serialNo in this category
    const maxRes = await manager
      .getRepository(GroupEntity)
      .createQueryBuilder('g')
      .setLock('pessimistic_write')
      .select('MAX(g.serial_no)', 'max')
      .where('g.category_id = :categoryId', { categoryId })
      .getRawOne();

    const nextSerial = (Number(maxRes?.max) || 0) + 1;

    general = manager.create(GroupEntity, {
      groupName: 'General',
      serialNo: nextSerial,
      category: { id: categoryId } as any,
    });

    return manager.save(general);
  }

  /**
   * - If no group in category: create General + create fields for all headers in it
   * - If groups exist: match headers against fields in ANY group; missing headers -> create fields in General
   * - Returns: fieldMap(normalizedName -> fieldId) and unique fieldIds
   */
  private async ensureFieldsForGeneralGroup(
    categoryId: string,
    headers: string[],
    manager: EntityManager,
  ): Promise<{
    fieldMap: Map<string, string>;
    fieldIds: string[];
    generalGroupId: string;
  }> {
    //  const groupRepo = manager.getRepository(GroupEntity);
    const fieldRepo = manager.getRepository(FieldEntity);

    // 1) Load groups for category

    // 2) Ensure General group exists (if no groups OR missing General)
    // If there are no groups, this will create General.
    const generalGroup = await this.ensureGeneralGroup(categoryId, manager);

    // 3) Load ALL fields for this category (across any group)
    // (single query, fast)
    const allFields = await fieldRepo
      .createQueryBuilder('f')
      .innerJoin('f.group', 'g')
      .where('g.category_id = :categoryId', { categoryId })
      .select([
        'f.id AS id',
        'f.field_name AS fieldName',
        'f.group_id AS groupId',
        'f.serial_no AS serialNo',
      ])
      .getRawMany<{
        id: string;
        fieldName: string;
        groupId: string;
        serialNo: number;
      }>();

    // Build lookup: normalizedName -> fieldId (from ANY group)
    const fieldMap = new Map<string, string>();
    for (const f of allFields) {
      const key = this.normalizeKey(f.fieldName);
      // if duplicates exist across groups, keep the first seen (or override if you want)
      if (key && !fieldMap.has(key)) fieldMap.set(key, f.id);
    }

    // 4) Determine next serialNo for NEW fields under General group
    const maxGeneralFieldSerialRes = await fieldRepo
      .createQueryBuilder('f')
      .setLock('pessimistic_write')
      .select('MAX(f.serial_no)', 'max')
      .where('f.group_id = :groupId', { groupId: generalGroup.id })
      .getRawOne();

    let nextFieldSerial = (Number(maxGeneralFieldSerialRes?.max) || 0) + 1;

    // 5) Create missing fields for headers ONLY under General group
    const toCreate: FieldEntity[] = [];
    for (const h of headers) {
      const key = this.normalizeKey(h);
      if (!key) continue;

      // OPTIONAL: skip non-attribute headers (adjust as you want)
      if (['model', 'description'].includes(key)) continue;

      if (!fieldMap.has(key)) {
        const newField = fieldRepo.create({
          fieldName: String(h).trim(),
          serialNo: nextFieldSerial++,
          group: { id: generalGroup.id } as any,
          // order/filter default false
        });
        toCreate.push(newField);
      }
    }

    if (toCreate.length) {
      const saved = await fieldRepo.save(toCreate);
      for (const f of saved) {
        fieldMap.set(this.normalizeKey(f.fieldName), f.id);
      }
    }

    // 6) Return fieldIds in the same order as headers (good for later consistent processing)
    // Unique, and only those relevant to headers.
    const fieldIds: string[] = [];
    const seen = new Set<string>();

    for (const h of headers) {
      const key = this.normalizeKey(h);
      if (!key) continue;

      // if (['model', 'description'].includes(key)) continue;

      const id = fieldMap.get(key);
      if (id && !seen.has(id)) {
        seen.add(id);
        fieldIds.push(id);
      }
    }

    return { fieldMap, fieldIds, generalGroupId: generalGroup.id };
  }
}
