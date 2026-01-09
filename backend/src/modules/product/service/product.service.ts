import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
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

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,

    @InjectRepository(ProductValueEntity)
    private readonly productValueRepository: Repository<ProductValueEntity>,

    @InjectRepository(ProductFileRelationEntity)
    private readonly productFileRelationRepository: Repository<ProductFileRelationEntity>,

    private readonly categoryService: CategoryService,
    private readonly fileService: FileService,
    private readonly fieldService: FieldService,

    private readonly dataSource: DataSource,
    private readonly groupService: GroupService,

    private readonly subCategoryService: SubCategoryService,
  ) {}

  async createProduct(createProductDto: CreateProductDto) {
    const {
      categoryId,
      subCategoryId,
      modelName,
      description,
      information,
      fileIds,
    } = createProductDto;

    // 1️⃣ CATEGORY VALIDATION
    const category = await this.categoryService.findCategoryById(categoryId);
    if (!category) {
      throw new NotFoundException(`Category not found`);
    }

    const exists = await this.productRepository.exists({
      where: { modelName },
    });

    if (exists) {
      throw new ConflictException(`Product with model name already exists`);
    }

    // 2️⃣ FIELD VALIDATION
    const fieldIds = information.map((i) => i.fieldId);
    await this.fieldService.findFieldsByIdsOrFail(fieldIds);

    // 3️⃣ FILE VALIDATION
    const files = await this.fileService.getFileByIds(fileIds);
    if (files.length !== fileIds.length) {
      const foundIds = files.map((f) => f.id);
      const missing = fileIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `These file IDs do not exist: ${missing.join(', ')}`,
      );
    }

    // check this sub-category exists
    if (subCategoryId) {
      const subCategory =
        await this.subCategoryService.getSubCategoryById(subCategoryId);

      if (!subCategory || subCategory.category.id !== categoryId) {
        throw new NotFoundException(`Sub-category not found`);
      }
    }
    // 4️⃣ TRANSACTION
    return await this.dataSource.transaction(async (manager) => {
      // A. Create product

      const newProduct = manager.create(ProductEntity, {
        modelName,
        description,
        category: { id: categoryId },
        subCategory: subCategoryId ? { id: subCategoryId } : null,
      });
      const savedProduct = await manager.save(ProductEntity, newProduct);

      //   console.log('savedProduct', savedProduct.id);
      // --------------------------------------------------------
      // B. BULK INSERT PRODUCT VALUES
      // --------------------------------------------------------

      if (information.length) {
        const valuePayload = information.map((info) => ({
          value: info.value,
          field: { id: info.fieldId },
          product: { id: savedProduct.id },
        }));

        //   console.log('information', valuePayload);
        const valueEntities = manager.create(ProductValueEntity, valuePayload);

        //   console.log('valueEntities', valueEntities);
        await manager.save(ProductValueEntity, valueEntities);

        // --------------------------------------------------------
        // C. BULK INSERT PRODUCT - FILE RELATIONS
        // --------------------------------------------------------

        const fileRelationPayload = fileIds.map((fileId) => ({
          product: { id: savedProduct.id },
          file: { id: fileId },
        }));

        const fileRelationEntities = manager.create(
          ProductFileRelationEntity,
          fileRelationPayload,
        );

        await manager.save(ProductFileRelationEntity, fileRelationEntities);
      }

      // 5️⃣ UPDATE FILE USED DATE
      await this.fileService.usedAtUpdate(fileIds, manager);

      // --------------------------------------------------------
      // D. RETURN PRODUCT WITH RELATIONS
      // --------------------------------------------------------

      return manager.findOne(ProductEntity, {
        where: { id: savedProduct.id },
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
    } = productUpsertDto;

    // 1️⃣ Load product with category + fields (NO transaction)
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['category', 'category.groups', 'category.groups.fields'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // -----------------------------
    // Preparation (only if information exists)
    // -----------------------------
    let toUpdate: typeof information = [];
    let toInsert: typeof information = [];
    let existingMap = new Map<string, ProductValueEntity>();

    if (information?.length) {
      // 2️⃣ Extract valid fieldIds for category
      const validFieldIds = new Set(
        product.category.groups.flatMap((g) => g.fields.map((f) => f.id)),
      );

      // 3️⃣ Validate incoming fieldIds
      const invalid = information.find((i) => !validFieldIds.has(i.fieldId));

      if (invalid) {
        throw new BadRequestException(
          `Field ${invalid.fieldId} does not belong to product's category`,
        );
      }

      // 4️⃣ Load existing product values
      const fieldIds = information.map((i) => i.fieldId);

      const existingValues = await this.productValueRepository.find({
        where: {
          product: { id: productId },
          field: { id: In(fieldIds) },
        },
        relations: ['field'],
      });

      existingMap = new Map(existingValues.map((pv) => [pv.field.id, pv]));

      // 5️⃣ Partition payload
      toUpdate = information.filter((i) => existingMap.has(i.fieldId));
      toInsert = information.filter((i) => !existingMap.has(i.fieldId));
    }

    // Prepare file relations (NO TRANSACTION)
    const fileRelationPayload = fileIds?.length
      ? fileIds.map((fileId) => ({
          product: { id: productId },
          file: { id: fileId },
        }))
      : [];

    // -----------------------------
    // Transaction (writes only)
    // -----------------------------
    await this.dataSource.transaction(async (manager) => {
      const productRepo = manager.getRepository(ProductEntity);
      const pvRepo = manager.getRepository(ProductValueEntity);
      const pfrRepo = manager.getRepository(ProductFileRelationEntity);

      // 6️⃣ Update product basic info
      if (modelName !== undefined || description !== undefined) {
        await productRepo.update(productId, {
          ...(modelName !== undefined && { modelName }),
          ...(description !== undefined && { description }),
        });
      }

      // 7️⃣ Update existing values
      if (toUpdate.length) {
        const entities = toUpdate.map((i) => {
          const entity = existingMap.get(i.fieldId)!;
          entity.value = i.value;
          return entity;
        });

        await pvRepo.save(entities);
      }

      // 8️⃣ Insert new values
      if (toInsert.length) {
        const insertPayload = toInsert.map((i) => ({
          value: i.value,
          product: { id: productId },
          field: { id: i.fieldId },
        }));

        await pvRepo
          .createQueryBuilder()
          .insert()
          .into(ProductValueEntity)
          .values(insertPayload)
          .orIgnore()
          .execute();
      }

      // 5️⃣ Handle file relations
      if (fileRelationPayload.length) {
        // 5.1 mark files as used
        await this.fileService.usedAtUpdate(fileIds, manager);

        // 5.2 create product-file relations
        await pfrRepo
          .createQueryBuilder()
          .insert()
          .into(ProductFileRelationEntity)
          .values(fileRelationPayload)
          .orIgnore()
          .execute();
      }
    });

    // 9️⃣ Return updated product
    return this.getProductDetails(productId);
  }

  //     id: productId,
  //     description,
  //     modelName,
  //     information = [],
  //   } = productUpsertDto;

  //   if (!information.length) {
  //     return this.productRepository.findOne({
  //       where: { id: productId },
  //       relations: ['productValues', 'productValues.field'],
  //     });
  //   }

  //   // 1️⃣ Load product with all category/field relations (NO transaction)
  //   const product = await this.productRepository.findOne({
  //     where: { id: productId },
  //     relations: ['category', 'category.groups', 'category.groups.fields'],
  //   });

  //   if (!product) throw new NotFoundException('Product not found');

  //   // 2️⃣ Extract valid fieldIds for this product's category
  //   const validFieldIds = new Set(
  //     product.category.groups.flatMap((g) => g.fields.map((f) => f.id)),
  //   );

  //   // 3️⃣ Validate provided fieldIds
  //   const invalid = information.find((it) => !validFieldIds.has(it.fieldId));
  //   if (invalid) {
  //     throw new BadRequestException(
  //       `Field ${invalid.fieldId} does not belong to product's category`,
  //     );
  //   }

  //   // 4️⃣ Find existing ProductValue rows for the provided fieldIds
  //   const fieldIds = information.map((i) => i.fieldId);

  //   const existingValues = await this.productValueRepository.find({
  //     where: {
  //       product: { id: productId },
  //       field: { id: In(fieldIds) },
  //     },
  //     relations: ['field'],
  //   });

  //   // 5️⃣ Create fast lookup table
  //   const existingMap = new Map(existingValues.map((pv) => [pv.field.id, pv]));

  //   // 6️⃣ Partition incoming data
  //   const toUpdate = information.filter((i) => existingMap.has(i.fieldId));
  //   const toInsert = information.filter((i) => !existingMap.has(i.fieldId));

  //   // 7️⃣ Now run writes inside a transaction
  //   await this.dataSource.transaction(async (manager) => {
  //     const productRepo = manager.getRepository(ProductEntity);
  //     const pvRepo = manager.getRepository(ProductValueEntity);

  //     if (modelName !== undefined || description !== undefined) {
  //       await productRepo.update(productId, {
  //         ...(modelName !== undefined && { modelName }),
  //         ...(description !== undefined && { description }),
  //       });
  //     }
  //     // Update batch
  //     if (toUpdate.length) {
  //       const updateEntities = toUpdate.map((i) => {
  //         const entity = existingMap.get(i.fieldId)!;
  //         entity.value = i.value;
  //         return entity;
  //       });

  //       // console.log('Updating entities:', updateEntities);
  //       await pvRepo.save(updateEntities);
  //     }

  //     // Insert batch
  //     if (toInsert.length) {
  //       const insertPayload = toInsert.map((i) => ({
  //         value: i.value,
  //         product: { id: productId },
  //         field: { id: i.fieldId },
  //       }));

  //       // console.log('Inserting entities:', insertPayload);
  //       await pvRepo
  //         .createQueryBuilder()
  //         .insert()
  //         .into(ProductValueEntity)
  //         .values(insertPayload)
  //         .orIgnore()
  //         .execute();
  //     }

  //     // return updated product
  //     // return manager.getRepository(ProductEntity).findOne({
  //     //   where: { id: productId },
  //     //   relations: ['productValues', 'productValues.field'],
  //     // });
  //   });
  //   return await this.getProductDetails(productId);
  // }

  // Transform raw product entity with joined relations
  private transformProductDetailsFromRaw(
    product: ProductEntity & {
      productValues?: ProductValueEntity[];
      productFiles?: ProductFileRelationEntity[];
    },
  ) {
    // 1️⃣ Group fields by groupName

    //console.log(product);
    const groupedFields: Record<
      string,
      { fieldId: string; fieldName: string; valueId: string; value: string }[]
    > = {};
    (product?.productValues || []).forEach((pv) => {
      const groupName = pv?.field?.group?.groupName;
      if (!groupedFields[groupName]) groupedFields[groupName] = [];
      groupedFields[groupName].push({
        fieldId: pv?.field?.id,
        fieldName: pv?.field?.fieldName,
        valueId: pv?.id,
        value: pv?.value,
      });
    });

    // console.log({ groupedFields });
    // 2️⃣ Extract files
    const files = (product.productFiles || []).map((pf) => pf.file);

    return {
      id: product?.id,
      modelName: product?.modelName,
      description: product?.description,
      category: product?.category,
      subCategory: product?.subCategory,
      group: groupedFields,
      files,
    };
  }

  // Single product fetch (uses single query)
  async getProductDetails(productId: string) {
    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productValues', 'productValue')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('productValue.field', 'field')
      .leftJoinAndSelect('field.group', 'group')
      .leftJoinAndSelect('product.productFiles', 'productFile')
      .leftJoinAndSelect('productFile.file', 'file')
      .where('product.id = :productId', { productId })
      .andWhere('product.isDeleted = false')
      .getOne();

    if (!product) throw new NotFoundException(`Product ${productId} not found`);

    return this.transformProductDetailsFromRaw(product);
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
  async findProductsByCategory(query: ProductFilterDto) {
    const { page, limit, modelName, groupName, fieldName, value } = query;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productValues', 'productValue')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.subCategory', 'subCategory')
      .leftJoinAndSelect('productValue.field', 'field')
      .leftJoinAndSelect('field.group', 'group')
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

    // Sorting
    // if (sortBy) qb.orderBy(`product.${sortBy}`, sortOrder ?? 'ASC');
    // else qb.orderBy('product.created_at', 'DESC');

    // Pagination
    qb.skip((page - 1) * limit).take(limit);

    const [rows, total] = await qb.getManyAndCount();

    // console.log({ rows });

    // Transform all products
    const products = rows.map((p) => this.transformProductDetailsFromRaw(p));

    return {
      meta: {
        total,
        page,
        limit,
        perPage: query.limit,
        totalPages: Math.ceil(total / limit),
      },
      products,
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
    const subCategoryIds = new Set(
      products.map((p) => p.subCategory?.id ?? null),
    );

    // If any products have subCategory, all must have the same one
    if (subCategoryIds.size > 1) {
      throw new BadRequestException(
        `All products must belong to the same sub-category for comparison`,
      );
    }
    // return products;
    return products.map((p) => this.transformProductDetailsFromRaw(p));
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
    // 1️⃣ Find product
    const product = await this.productRepository.findOne({
      where: { id: productId },
      select: ['id', 'isDeleted'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // 2️⃣ If already deleted → stop
    if (product.isDeleted) {
      throw new BadRequestException('Product is already deleted');
    }

    // 3️⃣ Soft delete
    product.isDeleted = true;
    await this.productRepository.save(product);

    // 4️⃣ Response
    return {
      id: product.id,
      isDeleted: true,
      message: 'Product soft-deleted successfully',
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

  async productCreateByExecl(categoryId: string, fileId: string) {
    // 1️⃣ Load groups & fields
    const groups = await this.groupService.findGroupsByCategoryId(categoryId);
    if (!groups.length) throw new NotFoundException('Category has no groups');

    // 2️⃣ Build fieldMap: fieldName -> fieldId (exact match)
    const fieldMap = new Map<string, string>();
    groups.forEach((group) => {
      group.fields.forEach((field) => {
        fieldMap.set(field.fieldName, field.id);
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
        const modelName = row['Modello MXS'];
        if (!modelName || typeof modelName !== 'string') {
          throw new BadRequestException('modelName is required');
        }

        // 5.1 Map Excel columns to database fields (exact match)
        const information = Object.entries(row)
          .filter(([key, value]) => fieldMap.has(key) && value != null)
          .map(([key, value]) => ({
            fieldId: fieldMap.get(key)!,
            value: String(value),
          }));

        // 5.2 Collect missing fields (exist in Excel but not in DB)
        const missingFields = Object.keys(row).filter(
          (key) => !fieldMap.has(key) && key !== 'Modello MXS',
        );

        if (missingFields.length > 0) {
          missingFieldsPerRow.push({ row: i + 2, missingFields }); // Excel row number
        }

        if (!information.length) {
          throw new BadRequestException('No valid fields found in row');
        }

        // 5.3 Build payload
        const payload: CreateProductDto = {
          categoryId,
          modelName,
          description: row['description'] ? row['description'] : 'unknown',
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
    // // 6️⃣ Bulk create products
    // const createdProducts: ProductEntity[] = [];
    // for (const payload of payloads) {
    //   try {
    //     const product = await this.createProduct(payload);
    //     createdProducts.push(product!);
    //   } catch (err) {
    //     rowErrors.push({
    //       row: 0,
    //       message: err instanceof Error ? err.message : 'Create product failed',
    //     });
    //   }
    // }

    // // 7️⃣ Return response
    // return {
    //   totalRows: rows.length,
    //   success: createdProducts.length,
    //   failed: rowErrors.length,
    //   errors: rowErrors,
    //   missingFields: missingFieldsPerRow,
    //   createdProducts,
    // };
  }
}
