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

  async dynamicProductSearch(dto: {
    categoryId?: string;
    subCategoryId?: string;
    fieldId?: string;
    valueId?: string;
  }) {
    if (!dto.categoryId) return [];
    let productIds: string[] = [];
    // Base product query
    let qb = this.productRepo
      .createQueryBuilder('product')
      .where('product.is_deleted = false');

    qb = qb.andWhere('product.category_id = :categoryId', {
      categoryId: dto.categoryId,
    });

    if (dto.subCategoryId)
      qb = qb.andWhere('product.sub_category_id = :subCategoryId', {
        subCategoryId: dto.subCategoryId,
      });
    if (dto.fieldId)
      qb = qb
        .innerJoin('product.productValues', 'pv')
        .andWhere('pv.field_id = :fieldId', { fieldId: dto.fieldId });
    if (dto.valueId)
      qb = qb.andWhere('pv.id = :valueId', { valueId: dto.valueId });

    const products = await qb
      .leftJoinAndSelect('product.subCategory', 'subCategory')
      .leftJoinAndSelect('product.productValues', 'productValues')
      .leftJoinAndSelect('productValues.field', 'field')
      .getMany();

    productIds = products.map((p) => p.id);

    // 1️⃣ categoryId only → subcategories OR fields
    if (dto.categoryId && !dto.subCategoryId && !dto.fieldId && !dto.valueId) {
      // Filter out products with null subCategory first
      const subCategories = Array.from(
        new Map(
          products
            .filter((p) => p.subCategory) // ignore null subCategory
            .map((p) => [p.subCategory!.id, p.subCategory!]), // ! tells TS it's not null here
        ).values(),
      );

      if (subCategories.length > 0) {
        return {
          subCategories: subCategories.map((s) => ({
            subCategoryId: s!.id, // ! safe because we filtered null
            subCategoryName: s!.subCategoryName,
          })),
          productIds,
        };
      } else {
        // No subcategories → return fields
        const fieldsMap = new Map();
        products.forEach((p) => {
          p.productValues?.forEach((pv) => {
            fieldsMap.set(pv.field.id, pv.field.fieldName);
          });
        });
        const fields = Array.from(fieldsMap.entries()).map(
          ([fieldId, fieldName]) => ({
            fieldId,
            fieldName,
          }),
        );
        return { fields, productIds };
      }
    }

    // 2️⃣ categoryId + subCategoryId → fields
    if (dto.categoryId && dto.subCategoryId && !dto.fieldId && !dto.valueId) {
      const fieldsMap = new Map();
      products.forEach((p) => {
        p.productValues?.forEach((pv) => {
          fieldsMap.set(pv.field.id, pv.field.fieldName);
        });
      });
      const fields = Array.from(fieldsMap.entries()).map(
        ([fieldId, fieldName]) => ({
          fieldId,
          fieldName,
          productIds: products.map((p) => p.id),
        }),
      );
      return fields;
    }

    // 3️⃣ categoryId + subCategoryId + fieldId → values
    if (dto.categoryId && dto.subCategoryId && dto.fieldId && !dto.valueId) {
      const valueMap = new Map();
      products.forEach((p) => {
        p.productValues?.forEach((pv) => {
          if (pv.field.id === dto.fieldId) {
            if (!valueMap.has(pv.id))
              valueMap.set(pv.id, {
                valueId: pv.id,
                value: pv.value,
                productIds: [],
              });
            valueMap.get(pv.id).productIds.push(p.id);
          }
        });
      });
      return Array.from(valueMap.values());
    }

    // 4️⃣ categoryId + subCategoryId + fieldId + valueId → product IDs only
    if (dto.categoryId && dto.subCategoryId && dto.fieldId && dto.valueId) {
      return productIds;
    }

    // 5️⃣ categoryId + fieldId → values
    if (dto.categoryId && !dto.subCategoryId && dto.fieldId && !dto.valueId) {
      const valueMap = new Map();
      products.forEach((p) => {
        p.productValues?.forEach((pv) => {
          if (pv.field.id === dto.fieldId) {
            if (!valueMap.has(pv.id))
              valueMap.set(pv.id, {
                valueId: pv.id,
                value: pv.value,
                productIds: [],
              });
            valueMap.get(pv.id).productIds.push(p.id);
          }
        });
      });
      return Array.from(valueMap.values());
    }

    // 6️⃣ categoryId + fieldId + valueId → product IDs
    if (dto.categoryId && !dto.subCategoryId && dto.fieldId && dto.valueId) {
      return productIds;
    }

    return [];
  }
}
