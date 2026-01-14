import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import {
  CategoryEntity,
  FieldEntity,
  ProductEntity,
  ProductValueEntity,
  SubCategoryEntity,
} from 'src/entities/product';
import { ProductService } from 'src/modules/product/service';
import { DynamicFilterDto } from '../dto';
import { CATEGORY_FIELDS } from 'src/common/constants';

export interface SearchResult {
  type: 'product' | 'category' | 'field' | 'value';
  id: string;
  name: string; // Display name
  field: string; // Where it was found
  match: string; // The matched text
  metadata: {
    categoryId?: string;
    categoryName?: string;
    subCategoryName?: string;
    productId?: string;
    productModel?: string;
    fieldId?: string;
    fieldName?: string;
    value?: string;
  };
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepo: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private categoryRepo: Repository<CategoryEntity>,
    @InjectRepository(SubCategoryEntity)
    private subCategoryRepo: Repository<SubCategoryEntity>,
    @InjectRepository(FieldEntity)
    private fieldRepo: Repository<FieldEntity>,
    @InjectRepository(ProductValueEntity)
    private productValueRepo: Repository<ProductValueEntity>,

    private readonly productService: ProductService,
  ) {}

  async search(query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // 1. Search Categories by name
    const [categories, products, subCategories, fields, values] =
      await Promise.all([
        this.categoryRepo.find({
          where: {
            categoryName: ILike(`%${searchTerm}%`),
          },
          take: 10,
        }),
        this.productRepo.find({
          where: {
            modelName: ILike(`%${searchTerm}%`),
            isDeleted: false,
          },
          relations: ['category'],
          take: 20,
        }),

        this.subCategoryRepo.find({
          where: {
            subCategoryName: ILike(`%${searchTerm}%`),
          },
          take: 10,
        }),
        this.fieldRepo
          .createQueryBuilder('field')
          .leftJoinAndSelect('field.productValues', 'productValues')
          .leftJoinAndSelect('productValues.product', 'product')
          .leftJoinAndSelect('product.category', 'category')
          .where('LOWER(field.field_name) LIKE :searchTerm', {
            searchTerm: `%${searchTerm}%`,
          })
          .andWhere('product.is_deleted = :isDeleted OR product.id IS NULL', {
            isDeleted: false,
          })
          .take(15)
          .getMany(),
        this.productValueRepo.find({
          where: {
            value: ILike(`%${searchTerm}%`),
          },
          relations: ['product', 'field', 'product.category'],
          take: 20,
        }),
      ]);

    categories.forEach((cat) => {
      results.push({
        type: 'category',
        id: cat.id,
        name: cat.categoryName,
        field: 'name',
        match: cat.categoryName,
        metadata: {
          categoryId: cat.id,
          categoryName: cat.categoryName,
        },
      });
    });

    // 2. Search Products by modelName

    products.forEach((product) => {
      results.push({
        type: 'product',
        id: product.id,
        name: product.modelName,
        field: 'modelName',
        match: product.modelName,
        metadata: {
          productId: product.id,
          productModel: product.modelName,
          categoryId: product.category?.id,
          categoryName: product.category?.categoryName,
        },
      });
    });

    subCategories.forEach((sub) => {
      results.push({
        type: 'category',
        id: sub.id,
        name: sub.subCategoryName,
        field: 'subCategoryName',
        match: sub.subCategoryName,
        metadata: {
          subCategoryName: sub.subCategoryName,
        },
      });
    });

    // 3. Search Field names - find related PRODUCTS

    fields.forEach((field) => {
      // Get unique products (active only)
      const uniqueProducts = new Map<string, any>();

      field.productValues?.forEach((pv) => {
        if (pv.product && !pv.product.isDeleted) {
          const key = `${pv.product.id}`;
          if (!uniqueProducts.has(key)) {
            uniqueProducts.set(key, {
              productId: pv.product.id,
              productModel: pv.product.modelName,
              categoryId: pv.product.category?.id,
              categoryName: pv.product.category?.categoryName,
              value: pv.value,
            });
          }
        }
      });

      const relatedProducts = Array.from(uniqueProducts.values());

      if (relatedProducts.length > 0) {
        relatedProducts.forEach((productInfo) => {
          results.push({
            type: 'field',
            id: field.id,
            name: field.fieldName,
            field: 'fieldName',
            match: field.fieldName,
            metadata: {
              fieldId: field.id,
              fieldName: field.fieldName,
              productId: productInfo.productId,
              productModel: productInfo.productModel,
              categoryId: productInfo.categoryId,
              categoryName: productInfo.categoryName,
              value: productInfo.value,
            },
          });
        });
      }
    });

    // 4. Search Product Values (field values)

    values.forEach((value) => {
      if (value.product && !value.product.isDeleted) {
        results.push({
          type: 'value',
          id: value.id,
          name: value.value,
          field: value.field?.fieldName || 'fieldValue',
          match: value.value,
          metadata: {
            fieldId: value.field?.id,
            fieldName: value.field?.fieldName,
            productId: value.product?.id,
            productModel: value.product?.modelName,
            categoryId: value.product?.category?.id,
            categoryName: value.product?.category?.categoryName,
          },
        });
      }
    });

    // Remove duplicates and return
    return results;
  }

  // Simple autocomplete/suggestions
  async getSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const searchTerm = query.toLowerCase();
    const suggestions = new Set<string>();

    // Get model names
    const products = await this.productRepo
      .createQueryBuilder('product')
      .select('product.model_name')
      .where('LOWER(product.model_name) LIKE :term', {
        term: `%${searchTerm}%`,
      })
      .andWhere('product.is_deleted = false')
      .limit(5)
      .getMany();

    products.forEach((p) => suggestions.add(p.modelName));

    // Get category names
    const categories = await this.categoryRepo
      .createQueryBuilder('category')
      .select('category.category_name')
      .where('LOWER(category.category_name) LIKE :term', {
        term: `%${searchTerm}%`,
      })
      .limit(5)
      .getMany();

    categories.forEach((c) => suggestions.add(c.categoryName));

    // Get field values
    const values = await this.productValueRepo
      .createQueryBuilder('pv')
      .select('pv.value')
      .where('LOWER(pv.value) LIKE :term', { term: `%${searchTerm}%` })
      .limit(5)
      .getMany();

    values.forEach((v) => suggestions.add(v.value));

    return Array.from(suggestions).slice(0, 10);
  }

  async dynamicProductSearch(dto: DynamicFilterDto) {
    const {
      categoryId,
      subCategoryId,
      modelName,
      filters,
      prpMin,
      prpMax,
      ltpMin,
      ltpMax,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = dto;

    /* --------------------------------
     * 1️⃣ CATEGORY → FIELD MAP
     * -------------------------------- */
    // get categoryName from categoryId
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      return {
        products: [],
        filterValues: {},
        meta: { total: 0, page, limit, totalPages: 0 },
      };
    }

    const categoryFields =
      CATEGORY_FIELDS[category.categoryName.toLowerCase()] || [];

    if (categoryFields.length === 0) {
      return {
        products: [],
        filterValues: {},
        meta: { total: 0, page, limit, totalPages: 0 },
      };
    }
    /* --------------------------------
     * 2️⃣ BASE QUERY
     * -------------------------------- */
    const baseQb = this.productRepo
      .createQueryBuilder('product')
      .leftJoin('product.productValues', 'pv')
      .leftJoin('pv.field', 'field')
      .where('product.isDeleted = false')
      .andWhere('product.category_id = :categoryId', { categoryId });

    if (subCategoryId) {
      baseQb.andWhere('product.sub_category_id = :subCategoryId', {
        subCategoryId,
      });
    }

    if (modelName) {
      baseQb.andWhere('LOWER(product.model_name) = :modelName', {
        modelName: modelName.toLowerCase(),
      });
    }
    /* --------------------------------
     * 3️⃣ DYNAMIC FILTERS
     * -------------------------------- */
    const addFilter = (qb, idx, fieldName: string, value: string) => {
      const alias = `pv_filter_${idx}`;
      qb.innerJoin(
        'product.productValues',
        alias,
        `${alias}.field_id = (SELECT id FROM field WHERE LOWER(field_name) = :field_${idx} LIMIT 1) AND ${alias}.value = :val_${idx}`,
        { [`field_${idx}`]: fieldName.toLowerCase(), [`val_${idx}`]: value },
      );
    };

    if (filters && Object.keys(filters).length > 0) {
      Object.entries(filters).forEach(([fieldName, value], idx) => {
        if (
          categoryFields
            .map((f) => f.toLowerCase())
            .includes(fieldName.toLowerCase())
        ) {
          addFilter(baseQb, idx, fieldName, value);
        }
      });
    }

    /* --------------------------------
     * 4️⃣ RANGE FILTERS (PRP / LTP)
     * -------------------------------- */

    const rangeFieldMap = {
      prp: 'prime power (prp) kva dg set',
      ltp: 'standby power power (ltp) kw dg set',
    } as const;

    const rangeFilters = [
      prpMin !== undefined || prpMax !== undefined
        ? {
            fieldName: rangeFieldMap.prp,
            min: prpMin ?? 0,
            max: prpMax ?? 999999,
          }
        : null,

      ltpMin !== undefined || ltpMax !== undefined
        ? {
            fieldName: rangeFieldMap.ltp,
            min: ltpMin ?? 0,
            max: ltpMax ?? 999999,
          }
        : null,
    ].filter(Boolean) as { fieldName: string; min: number; max: number }[];

    rangeFilters.forEach((rf, idx) => {
      const pvAlias = `pv_range_${idx}`;
      const fAlias = `f_range_${idx}`;

      baseQb.andWhere(
        `exists (
      select 1
      from product_value ${pvAlias}
      join field ${fAlias} on ${fAlias}.id = ${pvAlias}.field_id
      where ${pvAlias}.product_id = product.id
        and lower(${fAlias}.field_name) = :field_${idx}
        and cast(${pvAlias}.value as decimal(10,2))
            between :min_${idx} and :max_${idx}
    )`,
        {
          [`field_${idx}`]: rf.fieldName,
          [`min_${idx}`]: rf.min,
          [`max_${idx}`]: rf.max,
        },
      );
    });

    /* --------------------------------
     * 5️⃣ GET PRODUCT IDS
     * -------------------------------- */
    const [rows, total] = await baseQb
      .select(['product.id', `product.${sortBy}`])
      .orderBy(`product.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const productIds = rows.map((r) => r.id);

    if (!productIds.length) {
      return {
        products: [],
        filterValues: {},
        meta: { total: 0, page, limit, totalPages: 0 },
      };
    }

    /* --------------------------------
     * 6️⃣ FETCH FULL PRODUCTS WITH RELATIONS
     * -------------------------------- */
    const products = await this.productService.getProductsByIds(productIds);

    /* --------------------------------
     * 7️⃣ FILTER AGGREGATION (FACETS)
     * -------------------------------- */
    const filterQb = this.productRepo
      .createQueryBuilder('product')
      .leftJoin('product.productValues', 'pv')
      .leftJoin('pv.field', 'field')
      .where('product.id IN (:...ids)', { ids: productIds });

    //   .select([
    //     'field.id AS fieldId',
    //     'field.field_name AS fieldName',
    //     'pv.value AS value',
    //   ])
    //   .andWhere('LOWER(field.field_name) IN (:...fields)', {
    //     fields: categoryFields.map((f) => f.toLowerCase()),
    //   })
    //   .distinct(true)
    //   .getRawMany();

    // console.log('CATEGORY FIELDS:', categoryFields);
    const rawFilters = await filterQb
      .select([
        'field.id AS fieldId',
        'field.field_name AS fieldName',
        'pv.value AS value',
      ])
      .andWhere(
        categoryFields
          .map((_, idx) => `LOWER(field.field_name) LIKE :field_${idx}`)
          .join(' OR '),
        categoryFields.reduce(
          (acc, field, idx) => {
            acc[`field_${idx}`] = `%${field.toLowerCase()}%`;
            return acc;
          },
          {} as Record<string, string>,
        ),
      )
      .distinct(true)
      .getRawMany();

    // 2️⃣ Fetch MODELs from product table directly
    const modelRows = await this.productRepo
      .createQueryBuilder('product')
      .select(['product.modelName AS value'])
      .where('product.id IN (:...ids)', { ids: productIds })
      .distinct(true)
      .getRawMany();

    const filterValues: Record<string, { fieldId?: string; values: string[] }> =
      {};
    rawFilters.forEach(({ fieldName, fieldId, value }) => {
      if (!filterValues[fieldName])
        filterValues[fieldName] = { fieldId, values: [] };
      if (!filterValues[fieldName].values.includes(value))
        filterValues[fieldName].values.push(value);
    });

    filterValues['Model'] = {
      values: Array.from(new Set(modelRows.map((r) => r.value))),
    };
    /* --------------------------------
     * 8️⃣ RANGE META (MIN/MAX)
     * -------------------------------- */
    const { prp: prpRange, ltp: ltpRange } = await this.getPrpLtpRange(
      categoryId,
      subCategoryId,
    );

    /* --------------------------------
     * 9️⃣ FINAL RESPONSE
     * -------------------------------- */
    return {
      filterValues: { ...filterValues, prpRange, ltpRange },
      products,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  private async getPrpLtpRange(categoryId: string, subCategoryId?: string) {
    const [prpRange, ltpRange] = await Promise.all([
      this.productValueRepo
        .createQueryBuilder('pv')
        .innerJoin('pv.product', 'product')
        .innerJoin('pv.field', 'field')
        .select('MIN(CAST(pv.value AS DECIMAL(10,2)))', 'min')
        .addSelect('MAX(CAST(pv.value AS DECIMAL(10,2)))', 'max')
        .where('product.category_id = :categoryId', { categoryId })
        .andWhere(
          subCategoryId ? 'product.sub_category_id = :subCategoryId' : '1=1',
          { subCategoryId },
        )
        .andWhere('field.fieldName LIKE :name', {
          name: '%prime power (prp) kva dg set%',
        })
        .getRawOne(),

      this.productValueRepo
        .createQueryBuilder('pv')
        .innerJoin('pv.product', 'product')
        .innerJoin('pv.field', 'field')
        .select('MIN(CAST(pv.value AS DECIMAL(10,2)))', 'min')
        .addSelect('MAX(CAST(pv.value AS DECIMAL(10,2)))', 'max')
        .where('product.category_id = :categoryId', { categoryId })
        .andWhere(
          subCategoryId ? 'product.sub_category_id = :subCategoryId' : '1=1',
          { subCategoryId },
        )
        .andWhere('field.fieldName LIKE :name', {
          name: '%standby power power (ltp) kw dg set%',
        })
        .getRawOne(),
    ]);

    return {
      prp: {
        min: Number(prpRange?.min ?? 0),
        max: Number(prpRange?.max ?? 0),
      },
      ltp: {
        min: Number(ltpRange?.min ?? 0),
        max: Number(ltpRange?.max ?? 0),
      },
    };
  }
}
