import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import {
  FieldEntity,
  ProductEntity,
  ProductValueEntity,
} from 'src/entities/product';

@Injectable()
export class ProductFieldHelperService {
  // 1) Take categoryId + transaction(manager) => return all fieldIds under that category
  // NOTE: if you only want filter=true fields, just add `.andWhere('field.filter = :f', { f: true })`
  async getFieldIdsByCategoryId(
    categoryId: string,
    manager: EntityManager,
  ): Promise<string[]> {
    const rows = await manager
      .getRepository(FieldEntity)
      .createQueryBuilder('field')
      .innerJoin('field.group', 'group')
      .innerJoin('group.category', 'category')
      .where('category.id = :categoryId', { categoryId })
      .select(['field.id AS id'])
      .getRawMany();

    return rows.map((r) => r.id);
  }

  // 2) Take categoryId + transaction(manager) => return all productIds under that category
  async getProductIdsByCategoryId(
    categoryId: string,
    manager: EntityManager,
  ): Promise<string[]> {
    const rows = await manager
      .getRepository(ProductEntity)
      .createQueryBuilder('product')
      .innerJoin('product.category', 'category')
      .where('category.id = :categoryId', { categoryId })
      .select(['product.id AS id'])
      .getRawMany();

    return rows.map((r) => r.id);
  }

  // 3) Take productIds + fieldIds (+ transaction) =>
  //    if ProductValue exists do nothing, else create with empty string
  async ensureProductValuesExist(
    productIds: string[],
    fieldIds: string[],
    manager: EntityManager,
  ): Promise<void> {
    if (!productIds?.length || !fieldIds?.length) return;

    const existing = await manager
      .getRepository(ProductValueEntity)
      .createQueryBuilder('pv')
      .select(['pv.product_id AS productId', 'pv.field_id AS fieldId'])
      .where('pv.product_id IN (:...productIds)', { productIds })
      .andWhere('pv.field_id IN (:...fieldIds)', { fieldIds })
      .getRawMany<{ productId: string; fieldId: string }>();

    const existingSet = new Set(
      existing.map((e) => `${e.productId}::${e.fieldId}`),
    );

    const toInsert: Array<Partial<ProductValueEntity>> = [];
    for (const productId of productIds) {
      for (const fieldId of fieldIds) {
        const key = `${productId}::${fieldId}`;
        if (existingSet.has(key)) continue;

        toInsert.push({
          product: { id: productId } as any,
          field: { id: fieldId } as any,
          value: '',
        });
      }
    }

    if (!toInsert.length) return;

    // MySQL-safe: ignore duplicates if a race happens
    const CHUNK = 1000;
    for (let i = 0; i < toInsert.length; i += CHUNK) {
      await manager
        .createQueryBuilder()
        .insert()
        .into(ProductValueEntity)
        .values(toInsert.slice(i, i + CHUNK))
        .orIgnore()
        .execute();
    }
  }
}
