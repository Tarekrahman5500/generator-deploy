import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FieldEntity,
  ProductEntity,
  ProductFileRelationEntity,
  ProductValueEntity,
} from 'src/entities/product';
import { Repository, DataSource, In } from 'typeorm';
import { CategoryService } from './category.service';
import { FileService } from 'src/modules/file/file.service';
import { FieldService } from './field.service';
import {
  CreateProductDto,
  ProductCompareDto,
  ProductCreateGroupDto,
  ProductFilterDto,
  ProductUpsertDto,
} from '../dto';
import { GroupService } from 'src/modules/product/service/group.service';
import { GroupEntity } from 'src/entities/product/group.entity';
import { SubCategoryService } from './sub.category.service';
import {
  sortAndTransform,
  transformProductDetailsFromRaw,
} from 'src/modules/search/services/product.sort.util';
import { ProductFieldHelperService } from 'src/modules/product/service/product-field.helper.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,

    @InjectRepository(ProductValueEntity)
    private readonly productValueRepository: Repository<ProductValueEntity>,

    @InjectRepository(ProductFileRelationEntity)
    private readonly productFileRelationRepository: Repository<ProductFileRelationEntity>,

    @InjectRepository(FieldEntity)
    private readonly fieldRepository: Repository<FieldEntity>,

    private readonly categoryService: CategoryService,
    private readonly fileService: FileService,
    private readonly fieldService: FieldService,

    private readonly dataSource: DataSource,
    private readonly groupService: GroupService,

    private readonly subCategoryService: SubCategoryService,

    private readonly productFieldHelperService: ProductFieldHelperService,
  ) {}

  async createProduct(createProductDto: CreateProductDto) {
    const {
      categoryId,
      subCategoryId,
      serialNo,
      modelName,
      description,
      information,
      fileIds,
    } = createProductDto;

    // 1️⃣ PRE-TRANSACTION: GET operations & Validations
    const category = await this.categoryService.findCategoryById(categoryId);
    if (!category) throw new NotFoundException(`Category not found`);

    // Validate Sub-category
    if (subCategoryId) {
      const subCategory =
        await this.subCategoryService.getSubCategoryById(subCategoryId);
      if (!subCategory || subCategory.category.id !== categoryId) {
        throw new NotFoundException(`Sub-category not found`);
      }
    }

    // Validate Fields and Files
    const fieldIds = information.map((i) => i.fieldId);
    await this.fieldService.findFieldsByIdsOrFail(fieldIds);

    // Determine Next Global Serial (if serialNo is not provided)
    const maxSerialObj = await this.productRepository
      .createQueryBuilder('p')
      .select('MAX(p.serial_no)', 'max')
      .getRawOne();
    const nextAutoSerial = (Number(maxSerialObj?.max) || 0) + 1;

    if (fileIds && fileIds.length > 0) {
      const files = await this.fileService.getFileByIds(fileIds);
      if (files.length !== fileIds.length) {
        throw new NotFoundException(`File not found`);
      }
    }
    // 2️⃣ START TRANSACTION: WRITE operations
    return await this.dataSource.transaction(async (manager) => {
      /// get category filds
      const existingFields =
        await this.productFieldHelperService.getFieldIdsByCategoryId(
          categoryId,
          manager,
        );
      // A. HANDLE SERIAL NUMBER
      let finalSerial: number;
      if (serialNo !== undefined && serialNo !== null) {
        // Shift existing products out of the way
        await manager
          .createQueryBuilder()
          .update(ProductEntity)
          .set({ serialNo: () => 'serial_no + 1' })
          .where('serial_no >= :serialNo', { serialNo })
          .orderBy('serial_no', 'DESC') // Prevent Unique Constraint error
          .execute();
        finalSerial = serialNo;
      } else {
        finalSerial = nextAutoSerial;
      }

      // B. CREATE PRODUCT
      const newProduct = manager.create(ProductEntity, {
        modelName,
        description,
        serialNo: finalSerial, // Added serialNo here
        category: { id: categoryId },
        subCategory: subCategoryId ? { id: subCategoryId } : null,
      });
      const savedProduct = await manager.save(ProductEntity, newProduct);

      // C. BULK INSERT PRODUCT VALUES
      if (information.length) {
        const valuePayload = information.map((info) => ({
          value: info.value,
          field: { id: info.fieldId },
          product: { id: savedProduct.id },
        }));
        await manager.save(
          ProductValueEntity,
          manager.create(ProductValueEntity, valuePayload),
        );
      }

      // D. BULK INSERT PRODUCT - FILE RELATIONS
      if (fileIds.length > 0) {
        const fileRelationPayload = fileIds.map((fileId) => ({
          product: { id: savedProduct.id },
          file: { id: fileId },
        }));
        await manager.save(
          ProductFileRelationEntity,
          manager.create(ProductFileRelationEntity, fileRelationPayload),
        );

        // Update file usage metadata
        await this.fileService.usedAtUpdate(fileIds, manager);
      }
      // now ensure product fields are created for this product's category
      await this.productFieldHelperService.ensureProductValuesExist(
        [savedProduct.id],
        existingFields,
        manager,
      );
      // E. RETURN PRODUCT WITH RELATIONS
      return manager.findOne(ProductEntity, {
        where: { id: savedProduct.id },
        relations: ['category', 'subCategory', 'productValues', 'productFiles'],
      });
    });
  }

  async upsertProduct(productUpsertDto: ProductUpsertDto) {
    const {
      id: productId,
      description,
      fileIds = [],
      modelName,
      information,
      serialNo,
    } = productUpsertDto;

    // 1️⃣ PRE-TRANSACTION: GET operations
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['category', 'category.groups', 'category.groups.fields'],
    });

    if (!product) throw new NotFoundException('Product not found');

    const oldSerial = product.serialNo ?? 0;

    // 2️⃣ PREPARE FIELD VALUES (only if information exists)
    let toUpdate: typeof information = [];
    let toInsert: typeof information = [];
    let existingMap = new Map<string, ProductValueEntity>();

    if (information?.length) {
      const validFieldIds = new Set(
        product.category.groups.flatMap((g) => g.fields.map((f) => f.id)),
      );
      const invalid = information.find((i) => !validFieldIds.has(i.fieldId));
      if (invalid)
        throw new BadRequestException(
          `Field ${invalid.fieldId} invalid for category`,
        );

      const fieldIds = information.map((i) => i.fieldId);
      const existingValues = await this.productValueRepository.find({
        where: { product: { id: productId }, field: { id: In(fieldIds) } },
        relations: ['field'],
      });

      existingMap = new Map(existingValues.map((pv) => [pv.field.id, pv]));
      toUpdate = information.filter((i) => existingMap.has(i.fieldId));
      toInsert = information.filter((i) => !existingMap.has(i.fieldId));
    }

    // 3️⃣ PREPARE FILE RELATIONS
    let fileRelationPayload: Array<{
      product: { id: string };
      file: { id: string };
    }> = [];

    if (fileIds.length > 0) {
      const existingRelations = await this.productFileRelationRepository.find({
        where: { product: { id: productId } },
        relations: ['file'],
      });
      const existingFileIds = existingRelations.map((r) => r.file.id);
      const sameIds =
        fileIds?.length === existingFileIds.length &&
        fileIds?.every((id) => existingFileIds.includes(id));
      fileRelationPayload =
        fileIds && !sameIds
          ? fileIds.map((fileId) => ({
              product: { id: productId },
              file: { id: fileId },
            }))
          : [];
    }

    // 4️⃣ TRANSACTION (Writes Only)
    await this.dataSource.transaction(async (manager) => {
      const productRepo = manager.getRepository(ProductEntity);
      const pvRepo = manager.getRepository(ProductValueEntity);
      const pfrRepo = manager.getRepository(ProductFileRelationEntity);

      // --- A. HANDLE SERIAL NO SHIFTING ---
      if (typeof serialNo === 'number' && serialNo !== product.serialNo) {
        // Step 1: Set current to -1 to free the index
        await productRepo.update(productId, { serialNo: -1 });

        if (serialNo < oldSerial) {
          // Moving Up: Shift others Down
          await manager
            .createQueryBuilder()
            .update(ProductEntity)
            .set({ serialNo: () => 'serial_no + 1' })
            .where('serial_no >= :newS AND serial_no < :oldS AND id != :id', {
              newS: serialNo,
              oldS: oldSerial,
              id: productId,
            })
            .orderBy('serial_no', 'DESC')
            .execute();
        } else {
          // Moving Down: Shift others Up
          await manager
            .createQueryBuilder()
            .update(ProductEntity)
            .set({ serialNo: () => 'serial_no - 1' })
            .where('serial_no <= :newS AND serial_no > :oldS AND id != :id', {
              newS: serialNo,
              oldS: oldSerial,
              id: productId,
            })
            .orderBy('serial_no', 'ASC')
            .execute();
        }
        product.serialNo = serialNo;
      }

      // --- B. UPDATE PRODUCT BASIC INFO ---
      if (
        modelName !== undefined ||
        description !== undefined ||
        product.serialNo !== undefined
      ) {
        await productRepo.update(productId, {
          ...(modelName !== undefined && { modelName }),
          ...(description !== undefined && { description }),
          serialNo: product.serialNo,
        });
      }

      // --- C. UPSERT FIELD VALUES ---
      if (toUpdate.length) {
        const entities = toUpdate.map((i) => {
          const entity = existingMap.get(i.fieldId)!;
          entity.value = i.value;
          return entity;
        });
        await pvRepo.save(entities);
      }

      if (toInsert.length) {
        await pvRepo
          .createQueryBuilder()
          .insert()
          .into(ProductValueEntity)
          .values(
            toInsert.map((i) => ({
              value: i.value,
              product: { id: productId },
              field: { id: i.fieldId },
            })),
          )
          .orIgnore()
          .execute();
      }

      // --- D. HANDLE FILE RELATIONS ---
      if (fileRelationPayload.length) {
        await this.fileService.usedAtUpdate(fileIds, manager);
        await pfrRepo
          .createQueryBuilder()
          .insert()
          .into(ProductFileRelationEntity)
          .values(fileRelationPayload)
          .orIgnore()
          .execute();
      }
    });

    return this.getProductDetails(productId);
  }

  async getProductDetails(productId: string) {
    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productValues', 'productValue')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.subCategory', 'subCategory')
      .leftJoinAndSelect('productValue.field', 'field')
      .leftJoinAndSelect('field.group', 'group')
      .leftJoinAndSelect('product.productFiles', 'productFile')
      .leftJoinAndSelect('productFile.file', 'file')
      .where('product.id = :productId', { productId })
      .andWhere('product.isDeleted = false')
      .orderBy('field.serial_no', 'ASC')
      .getOne();

    if (!product) throw new NotFoundException(`Product ${productId} not found`);

    return transformProductDetailsFromRaw(product);
  }

  async productCreateWithGroup(payload: ProductCreateGroupDto) {
    const fileIds = payload?.product?.fileIds ?? [];

    const category = await this.categoryService.findCategoryById(
      payload.categoryId,
    );
    if (!category) {
      throw new NotFoundException(`Category not found`);
    }

    // Validate files
    const files = await this.fileService.getFileByIds(fileIds);
    if (files.length !== fileIds.length) {
      const foundIds = files.map((f) => f.id);
      const missing = fileIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `These file IDs do not exist: ${missing.join(', ')}`,
      );
    }

    // FIX: Initialize as null
    let group: GroupEntity | null = null;
    let productId: string | null = null;

    await this.dataSource.transaction(async (manager) => {
      // 1. Find or create group
      group = await this.groupService.findOrCreateGroup(
        category,
        payload.groupName,
        manager,
      );

      // 2. If product info is provided → create product
      if (payload.product) {
        let product: ProductEntity;
        const existingProduct = await manager.findOne(ProductEntity, {
          where: {
            modelName: payload.product.modelName,
            category: { id: payload.categoryId },
          },
        });

        if (existingProduct) {
          // UPDATE existing product
          product = await manager.save(ProductEntity, {
            ...existingProduct,
            description:
              payload.product.description || existingProduct.description,
            // Add other fields you want to update
          });
        } else {
          // CREATE new product
          const newProduct = manager.create(ProductEntity, {
            modelName: payload.product.modelName,
            description: payload.product.description,
            category: category,
          });
          product = await manager.save(ProductEntity, newProduct);
        }

        productId = product.id;

        const fileRelationPayload = fileIds.map((fileId) => ({
          product: product,
          file: { id: fileId },
        }));

        const fileRelationEntities = manager.create(
          ProductFileRelationEntity,
          fileRelationPayload,
        );

        await manager.save(ProductFileRelationEntity, fileRelationEntities);

        // 5️⃣ UPDATE FILE USED DATE
        await this.fileService.usedAtUpdate(fileIds, manager);

        // 3. Upsert fields
        if (payload.product.information) {
          await this.fieldService.upsertProductValuesForGroup(
            product,
            group,
            payload.product.information,
            manager,
          );
        }
      }
    });

    // FIX: Hard runtime safety check
    if (!group) throw new InternalServerErrorException('Group creation failed');

    let returnProduct: any | null = null;

    if (productId !== null) {
      // FIX: TypeScript NOW knows product is ProductEntity
      returnProduct = await this.getProductDetails(productId);
    }

    return {
      group,
      ...returnProduct,
    };
  }

  // Multiple products fetch (reusable for findProductsByCategory)
  // async findProductsByCategory(query: ProductFilterDto) {
  //   const { page, limit, modelName, groupName, fieldName, value } = query;

  //   const qb = this.productRepository
  //     .createQueryBuilder('product')
  //     .leftJoinAndSelect('product.productValues', 'productValue')
  //     .leftJoinAndSelect('product.category', 'category')
  //     .leftJoinAndSelect('product.subCategory', 'subCategory')
  //     .leftJoinAndSelect('productValue.field', 'field')
  //     .leftJoinAndSelect('field.group', 'group')
  //     .leftJoinAndSelect('product.productFiles', 'productFile')
  //     .leftJoinAndSelect('productFile.file', 'file')
  //     .where(query.categoryId ? 'product.category_id = :categoryId' : '1=1', {
  //       categoryId: query.categoryId,
  //     })
  //     .andWhere('product.isDeleted = false')
  //     .andWhere('category.isDeleted = false');

  //   // Filters
  //   if (modelName)
  //     qb.andWhere('product.model_name LIKE :modelName', {
  //       modelName: `%${modelName}%`,
  //     });
  //   if (groupName)
  //     qb.andWhere('group.group_name LIKE :groupName', {
  //       groupName: `%${groupName}%`,
  //     });
  //   if (fieldName)
  //     qb.andWhere('field.field_name LIKE :fieldName', {
  //       fieldName: `%${fieldName}%`,
  //     });
  //   if (value)
  //     qb.andWhere('productValue.value LIKE :value', { value: `%${value}%` });

  //   // Pagination
  //   qb.skip((page - 1) * limit).take(limit);

  //   const [rows, total] = await qb.getManyAndCount();

  //   // console.log({ rows });

  //   // Transform all products
  //   const products = rows
  //     .map((p) => this.transformProductDetailsFromRaw(p))
  //     .sort((a, b) => a.serialNo - b.serialNo);

  //   return {
  //     meta: {
  //       total,
  //       page,
  //       limit,
  //       perPage: query.limit,
  //       totalPages: Math.ceil(total / limit),
  //     },
  //     products,
  //   };
  // }

  async findProductsByCategory(query: ProductFilterDto) {
    const {
      page = 1,
      limit = 10,
      modelName,
      groupName,
      fieldName,
      value,
    } = query;

    // 1️⃣ Fetch all products with related values, fields, groups, files
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productValues', 'productValue')
      .leftJoinAndSelect('productValue.field', 'field')
      .leftJoinAndSelect('field.group', 'group')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.subCategory', 'subCategory')
      .leftJoinAndSelect('product.productFiles', 'productFile')
      .leftJoinAndSelect('productFile.file', 'file')
      .where(query.categoryId ? 'product.category_id = :categoryId' : '1=1', {
        categoryId: query.categoryId,
      })
      .andWhere('product.isDeleted = false')
      .andWhere('category.isDeleted = false');

    // Filters
    if (modelName)
      qb.andWhere('product.model_name LIKE :modelName', {
        modelName: `%${modelName}%`,
      });
    if (groupName)
      qb.andWhere('group.group_name LIKE :groupName', {
        groupName: `%${groupName}%`,
      });
    if (fieldName)
      qb.andWhere('field.field_name LIKE :fieldName', {
        fieldName: `%${fieldName}%`,
      });
    if (value)
      qb.andWhere('productValue.value LIKE :value', { value: `%${value}%` });

    // Pagination
    qb.skip((page - 1) * limit).take(limit);

    const [productsRaw, total] = await qb.getManyAndCount();

    return {
      meta: {
        total,
        page,
        limit,
        perPage: limit,
        totalPages: Math.ceil(total / limit),
      },
      products: sortAndTransform(productsRaw),
    };
  }

  // ---------------------------
  // Transform each product
  // ---------------------------
  private transformProductWithFullGroups(
    product: ProductEntity & {
      productValues?: ProductValueEntity[];
      productFiles?: ProductFileRelationEntity[];
    },
    allGroups: Record<
      string,
      { serialNo: number | null; fieldId: string; fieldName: string }[]
    >,
  ) {
    // Map product values by fieldId for quick lookup
    const valueMap: Record<string, ProductValueEntity> = {};
    (product.productValues || []).forEach((pv) => {
      if (pv.field?.id) valueMap[pv.field.id] = pv;
    });

    // Build grouped fields: all groups, fill product values if exists
    const groupedFields: Record<
      string,
      {
        serialNo: number | null;
        fieldId: string;
        fieldName: string;
        valueId: string | null;
        value: string | null;
      }[]
    > = {};

    Object.keys(allGroups).forEach((groupName) => {
      groupedFields[groupName] = allGroups[groupName].map((f) => {
        const pv = valueMap[f.fieldId];
        return {
          serialNo: f.serialNo,
          fieldId: f.fieldId,
          fieldName: f.fieldName,
          valueId: pv?.id ?? null,
          value: pv?.value ?? null,
        };
      });
    });

    // Files
    const files = (product.productFiles || []).map((pf) => pf.file);

    return {
      id: product.id,
      serialNo: product.serialNo,
      modelName: product.modelName,
      description: product.description,
      category: product.category,
      subCategory: product.subCategory,
      group: groupedFields, // ✅ all groups + fields for the product
      files,
    };
  }

  async getProductsByIds(productIds: string[]) {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productValues', 'productValue')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.subCategory', 'subCategory')
      .leftJoinAndSelect('productValue.field', 'field')
      .leftJoinAndSelect('field.group', 'group')
      .leftJoinAndSelect('product.productFiles', 'productFile')
      .leftJoinAndSelect('productFile.file', 'file')
      .where('product.id IN (:...productIds)', { productIds })
      .andWhere('product.isDeleted = false')
      .andWhere('category.isDeleted = false')
      .getMany();

    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id);
      const missing = productIds.filter((id) => !foundIds.includes(id));

      throw new NotFoundException(`Product not found: ${missing.join(', ')}`);
    }

    const categoryIds = new Set(products.map((p) => p.category.id));

    if (categoryIds.size > 1) {
      throw new BadRequestException(
        `All products must belong to the same category for comparison`,
      );
    }

    // Check that all products have the same sub-category (if subCategory is set)
    // const subCategoryIds = new Set(
    //   products.map((p) => p.subCategory?.id ?? null),
    // );

    // // If any products have subCategory, all must have the same one
    // if (subCategoryIds.size > 1) {
    //   throw new BadRequestException(
    //     `All products must belong to the same sub-category for comparison`,
    //   );
    // }
    // return products;
    return sortAndTransform(products);
  }

  async compareProducts(productCompareDto: ProductCompareDto) {
    return await this.getProductsByIds(productCompareDto.productIds);
  }

  async productMissingFields(productId: string) {
    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoin('category.groups', 'group')
      .leftJoin('group.fields', 'field')
      .leftJoin(
        'product.productValues',
        'pv',
        'pv.field_id = field.id AND pv.product_id = product.id',
      )
      .select([
        // product
        'product.id',
        // 'product.modelName',

        // category
        'category.id',
        'category.categoryName',

        // group
        'group.id',
        'group.groupName',

        // field
        'field.id',
        'field.fieldName',
      ])
      .where('product.id = :productId', { productId })
      .andWhere('pv.id IS NULL')
      .andWhere('product.isDeleted = false')
      .andWhere('category.isDeleted = false')
      .getOne();

    return product;
  }

  async softDeleteProduct(productId: string) {
    // // 1️⃣ Find product
    // const product = await this.productRepository.findOne({
    //   where: { id: productId },
    //   select: ['id', 'isDeleted'],
    // });

    // if (!product) {
    //   throw new NotFoundException('Product not found');
    // }

    // // 2️⃣ If already deleted → stop
    // if (product.isDeleted) {
    //   throw new BadRequestException('Product is already deleted');
    // }

    // // 3️⃣ Soft delete
    // product.isDeleted = true;
    // await this.productRepository.save(product);

    await this.productRepository.delete({ id: productId });

    // 4️⃣ Response
    return {
      message: 'Product deleted successfully',
    };
  }

  async productFieldValueDelete(valueId: string) {
    // 1️⃣ Find product value
    const productValue = await this.productValueRepository.findOne({
      where: { id: valueId },
      relations: ['product', 'field'],
    });

    if (!productValue) {
      throw new NotFoundException('Product value not found');
    }

    // 2️⃣ Delete
    await this.productValueRepository.delete({ id: valueId });

    // 3️⃣ Response
    return {
      id: productValue.id,
      fieldId: productValue.field.id,
      productId: productValue.product.id,
      message: 'Product value deleted successfully',
    };
  }

  // async productCreateByExecl(categoryId: string, fileId: string) {
  //   // 1️⃣ Load groups & fields
  //   const groups = await this.groupService.findGroupsByCategoryId(categoryId);
  //   if (!groups.length) throw new NotFoundException('Category has no groups');

  //   // 2️⃣ Build fieldMap: fieldName -> fieldId (I need as like match or as like close to execl columns names)
  //   const fieldMap = new Map<string, string>();
  //   groups.forEach((group) => {
  //     group.fields.forEach((field) => {
  //       fieldMap.set(field.fieldName, field.id);
  //     });
  //   });

  //   if (!fieldMap.size) throw new BadRequestException('Category has no fields');

  //   // 3️⃣ Load file & get buffer
  //   const [file] = await this.fileService.getFileByIds([fileId]);
  //   if (!file) throw new NotFoundException('Excel file not found');
  //   const buffer = await this.fileService.getFileBuffer(file);

  //   // 4️⃣ Extract Excel rows
  //   const rows = this.fileService.execlExtractData(buffer);
  //   if (!rows.length) throw new BadRequestException('Excel file is empty');

  //   // 5️⃣ Process rows
  //   const payloads: CreateProductDto[] = [];
  //   const rowErrors: { row: number; message: string }[] = [];
  //   const missingFieldsPerRow: { row: number; missingFields: string[] }[] = [];

  //   rows.forEach((row, i) => {
  //     try {
  //       const modelName = row['Modello MXS'];
  //       if (!modelName || typeof modelName !== 'string') {
  //         throw new BadRequestException('modelName is required');
  //       }

  //       // 5.1 Map Excel columns to database fields (exact match)
  //       const information = Object.entries(row)
  //         .filter(([key, value]) => fieldMap.has(key) && value != null)
  //         .map(([key, value]) => ({
  //           fieldId: fieldMap.get(key)!,
  //           value: String(value),
  //         }));

  //       // 5.2 Collect missing fields (exist in Excel but not in DB)
  //       const missingFields = Object.keys(row).filter(
  //         (key) => !fieldMap.has(key) && key !== 'Modello MXS',
  //       );

  //       if (missingFields.length > 0) {
  //         missingFieldsPerRow.push({ row: i + 2, missingFields }); // Excel row number
  //       }

  //       if (!information.length) {
  //         throw new BadRequestException('No valid fields found in row');
  //       }

  //       // 5.3 Build payload
  //       const payload: CreateProductDto = {
  //         categoryId,
  //         modelName,
  //         description: row['description'] ? row['description'] : 'unknown',
  //         information,
  //         fileIds: [],
  //       };

  //       payloads.push(payload);
  //     } catch (err) {
  //       rowErrors.push({
  //         row: i + 2,
  //         message:
  //           err instanceof Error ? err.message : 'Unknown error occurred',
  //       });
  //     }
  //   });

  //   return {
  //     payloads,
  //     totalRows: rows.length,
  //     success: payloads.length,
  //     failed: rowErrors.length,
  //     errors: rowErrors,
  //     missingFields: missingFieldsPerRow,
  //   };
  //   // // 6️⃣ Bulk create products
  //   // const createdProducts: ProductEntity[] = [];
  //   // for (const payload of payloads) {
  //   //   try {
  //   //     const product = await this.createProduct(payload);
  //   //     createdProducts.push(product!);
  //   //   } catch (err) {
  //   //     rowErrors.push({
  //   //       row: 0,
  //   //       message: err instanceof Error ? err.message : 'Create product failed',
  //   //     });
  //   //   }
  //   // }

  //   // // 7️⃣ Return response
  //   // return {
  //   //   totalRows: rows.length,
  //   //   success: createdProducts.length,
  //   //   failed: rowErrors.length,
  //   //   errors: rowErrors,
  //   //   missingFields: missingFieldsPerRow,
  //   //   createdProducts,
  //   // };
  // }
  async productCreateByExecl(categoryId: string, fileId: string) {
    // 1️⃣ Load groups & fields
    const groups = await this.groupService.findGroupsByCategoryId(categoryId);
    if (!groups.length) throw new NotFoundException('Category has no groups');

    // 2️⃣ Build normalized fieldMap
    // We normalize keys (lowercase, trim, remove special chars) to allow flexible matching
    const fieldMap = new Map<string, { id: string; originalName: string }>();

    const normalize = (str: string) =>
      str
        .toLowerCase()
        .replace(/[\s_-]/g, '')
        .trim();

    groups.forEach((group) => {
      group.fields.forEach((field) => {
        // Map the normalized version of the DB field name to the ID
        fieldMap.set(normalize(field.fieldName), {
          id: field.id,
          originalName: field.fieldName,
        });
      });
    });

    if (!fieldMap.size) throw new BadRequestException('Category has no fields');

    // 3️⃣ Load file & get buffer
    const [file] = await this.fileService.getFileByIds([fileId]);
    if (!file) throw new NotFoundException('Excel file not found');
    const buffer = await this.fileService.getFileBuffer(file);

    // 4️⃣ Extract Excel rows
    const rows = this.fileService.execlExtractData(buffer);
    if (!rows.length) throw new BadRequestException('Excel file is empty');

    // 5️⃣ Process rows
    const payloads: CreateProductDto[] = [];
    const rowErrors: { row: number; message: string }[] = [];
    const missingFieldsPerRow: { row: number; missingFields: string[] }[] = [];

    rows.forEach((row, i) => {
      try {
        // Find modelName using flexible key matching
        const modelKey = Object.keys(row).find(
          (k) => normalize(k) === normalize('Modello MXS'),
        );
        const modelName = modelKey ? row[modelKey] : null;

        if (!modelName || typeof modelName !== 'string') {
          throw new BadRequestException('modelName (Modello MXS) is required');
        }

        const information: { fieldId: string; value: string }[] = [];
        const missingFields: string[] = [];

        // Iterate through every column in the current Excel row
        Object.entries(row).forEach(([excelHeader, value]) => {
          const normalizedHeader = normalize(excelHeader);
          const match = fieldMap.get(normalizedHeader);

          // Ignore the primary model name column and empty values
          if (
            normalizedHeader === normalize('Modello MXS') ||
            normalizedHeader === 'description'
          ) {
            return;
          }

          if (match && value != null) {
            information.push({
              fieldId: match.id,
              value: String(value),
            });
          } else if (!match) {
            // If it's not in our map and not a standard field, it's "missing" from DB
            missingFields.push(excelHeader);
          }
        });

        if (missingFields.length > 0) {
          missingFieldsPerRow.push({ row: i + 2, missingFields });
        }

        if (!information.length) {
          throw new BadRequestException(
            'No valid attributes found for this category',
          );
        }

        // 5.3 Build payload
        const payload: CreateProductDto = {
          categoryId,
          modelName,
          description: row['description'] || row['Description'] || 'unknown',
          information,
          fileIds: [],
        };

        payloads.push(payload);
      } catch (err) {
        rowErrors.push({
          row: i + 2,
          message:
            err instanceof Error ? err.message : 'Unknown error occurred',
        });
      }
    });

    return {
      payloads,
      totalRows: rows.length,
      success: payloads.length,
      failed: rowErrors.length,
      errors: rowErrors,
      missingFields: missingFieldsPerRow,
    };
  }
}
