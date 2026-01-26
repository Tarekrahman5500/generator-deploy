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
import { DynamicFilterDto, SingleProductDto } from '../dto';
import { analyzeFieldValues } from './product.sort.util';

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
      modelNames,
      filters,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = dto;

    // console.log(filters);
    /* --------------------------------
     * 1️⃣ CATEGORY → FIELD MAP
     * -------------------------------- */
    // get categoryName from categoryId
    const category = await this.categoryRepo
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.groups', 'group')
      .leftJoinAndSelect('group.fields', 'field', 'field.filter = :filter', {
        filter: true,
      })
      .where('category.id = :categoryId', { categoryId })
      .getOne();

    if (!category) {
      return {
        products: [],
        meta: { total: 0, page, limit, totalPages: 0 },
      };
    }

    /* --------------------------------
     * 2️⃣ BASE QUERY
     * -------------------------------- */

    //console.log(categoryId);
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

    if (modelNames && modelNames.length > 0) {
      baseQb.andWhere('LOWER(product.model_name) IN (:...modelNames)', {
        modelNames: modelNames.map((name) => name.toLowerCase()),
      });
    }
    /* --------------------------------
     * 3️⃣ DYNAMIC FILTERS
     * -------------------------------- */
    // const addFilter = (qb, idx, fieldName: string, value: string) => {
    //   const alias = `pv_filter_${idx}`;
    //   qb.innerJoin(
    //     'product.productValues',
    //     alias,
    //     `${alias}.field_id = (SELECT id FROM field WHERE LOWER(field_name) = :field_${idx} LIMIT 1) AND ${alias}.value = :val_${idx}`,
    //     { [`field_${idx}`]: fieldName.toLowerCase(), [`val_${idx}`]: value },
    //   );
    // };

    // if (filters && Object.keys(filters).length > 0) {
    //   // solve the range problem but no input style change
    //   Object.entries(filters).forEach(([fieldName, value], idx) => {
    //     if (
    //       categoryFields
    //         .map((f) => f.toLowerCase())
    //         .includes(fieldName.toLowerCase())
    //     ) {
    //       addFilter(baseQb, idx, fieldName, value);
    //     }
    //   });
    // }

    const addFilter = (
      qb,
      idx: number,
      fieldId: string,
      value: string | number | { min: number; max: number },
    ) => {
      const alias = `pv_filter_${idx}`;

      // RANGE FILTER
      if (
        typeof value === 'object' &&
        value !== null &&
        'min' in value &&
        'max' in value
      ) {
        qb.innerJoin(
          'product.productValues',
          alias,
          `
        ${alias}.field_id = :field_${idx}
        AND CAST(${alias}.value AS DECIMAL(10,2)) >= :min_${idx}
        AND CAST(${alias}.value AS DECIMAL(10,2)) <= :max_${idx}
      `,
          {
            [`field_${idx}`]: fieldId,
            [`min_${idx}`]: value.min,
            [`max_${idx}`]: value.max,
          },
        );
      } else {
        // EXACT MATCH (existing behavior)
        qb.innerJoin(
          'product.productValues',
          alias,
          `
      ${alias}.field_id = :field_${idx}
      AND ${alias}.value = :val_${idx}
    `,
          {
            [`field_${idx}`]: fieldId,
            [`val_${idx}`]: String(value),
          },
        );
      }
    };

    if (filters && Object.keys(filters).length > 0) {
      Object.entries(filters).forEach(([fieldId, value], idx) => {
        addFilter(baseQb, idx, fieldId, value as any);
      });
    }

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
        meta: { total: 0, page, limit, totalPages: 0 },
      };
    }

    /* --------------------------------
     * 6️⃣ FETCH FULL PRODUCTS WITH RELATIONS
     * -------------------------------- */
    const products = await this.productService.getProductsByIds(productIds);

    /* --------------------------------
     * 9️⃣ FINAL RESPONSE
     * -------------------------------- */
    return {
      products,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async singleProductSearch(dto: SingleProductDto) {
    const { page = 1, limit = 10 } = dto;

    // 1️⃣ Base category (serialNo = 1)
    const baseCategory = dto.categoryId
      ? await this.categoryRepo.findOne({
          where: { id: dto.categoryId },
        })
      : await this.categoryRepo.findOne({
          order: { serialNo: 'ASC' },
        });

    if (!baseCategory) {
      return {
        products: [],
        filterValues: [],
        meta: { total: 0, page, limit, totalPages: 0 },
      };
    }

    // 2️⃣ Product search (unchanged)
    const response = await this.dynamicProductSearch({
      ...dto,
      categoryId: baseCategory.id,
    });

    // console.log('SINGLE PRODUCT SEARCH RESPONSE:', response);
    // 3️⃣ All categories ordered by serialNo
    const categories = [baseCategory];

    // 4️⃣ Fetch all filters in ONE query
    const rawFilters = await this.productRepo
      .createQueryBuilder('product')
      .innerJoin('product.productValues', 'pv')
      .innerJoin('pv.field', 'field', 'field.filter = :filter', {
        filter: true,
      })
      .where('product.category_id IN (:...categoryIds)', {
        categoryIds: categories.map((c) => c.id),
      })
      .select([
        'product.category_id AS categoryId',
        'field.id AS fieldId',
        'field.field_name AS fieldName',
        'pv.value AS value',
      ])
      .distinct(true)
      .getRawMany();

    // 5️⃣ Aggregate by category (internal map)
    // const categoryMap = new Map<
    //   string,
    //   {
    //     categoryId: string;
    //     serialNo: number;
    //     categoryName: string;
    //     values: Record<string, { fieldId?: string; values: string[] }>;
    //   }
    // >();

    // rawFilters.forEach(({ categoryId, fieldId, fieldName, value }) => {
    //   const category = categories.find((c) => c.id === categoryId);
    //   if (!category) return;

    //   if (!categoryMap.has(category.id)) {
    //     categoryMap.set(category.id, {
    //       categoryId: category.id,
    //       serialNo: category.serialNo,
    //       categoryName: category.categoryName,
    //       values: {},
    //     });
    //   }

    //   const values = categoryMap.get(category.id)!.values;

    //   if (!values[fieldName]) {
    //     values[fieldName] = { fieldId, values: [] };
    //   }

    //   if (!values[fieldName].values.includes(value)) {
    //     values[fieldName].values.push(value);
    //   }
    // });

    // // 6️⃣ Convert Map → Array (FINAL SHAPE)
    // const filterValues = Array.from(categoryMap.values()).sort(
    //   (a, b) => a.serialNo - b.serialNo,
    // );

    // 5️⃣ Aggregate by category (internal map)
    const categoryMap = new Map<
      string,
      {
        categoryId: string;
        serialNo: number;
        categoryName: string;
        values: Record<
          string,
          {
            fieldId: string;
            rawValues: string[];
          }
        >;
      }
    >();

    rawFilters.forEach(({ categoryId, fieldId, fieldName, value }) => {
      const category = categories.find((c) => c.id === categoryId);
      if (!category) return;

      if (!categoryMap.has(category.id)) {
        categoryMap.set(category.id, {
          categoryId: category.id,
          serialNo: category.serialNo,
          categoryName: category.categoryName,
          values: {},
        });
      }

      const values = categoryMap.get(category.id)!.values;

      if (!values[fieldName]) {
        values[fieldName] = {
          fieldId,
          rawValues: [],
        };
      }

      if (!values[fieldName].rawValues.includes(value)) {
        values[fieldName].rawValues.push(value);
      }
    });

    // 6️⃣ Convert + analyze field values (FINAL SHAPE)
    const filterValues = Array.from(categoryMap.values())
      .sort((a, b) => a.serialNo - b.serialNo)
      .map((category) => ({
        categoryId: category.categoryId,
        serialNo: category.serialNo,
        categoryName: category.categoryName,
        values: Object.fromEntries(
          Object.entries(category.values).map(
            ([fieldName, { fieldId, rawValues }]) => {
              const analyzed = analyzeFieldValues(rawValues);

              return [
                fieldName,
                {
                  fieldId,
                  ...analyzed,
                },
              ];
            },
          ),
        ),
      }));

    return {
      products: response.products,
      meta: response.meta,
      filterValues,
    };
  }
}
