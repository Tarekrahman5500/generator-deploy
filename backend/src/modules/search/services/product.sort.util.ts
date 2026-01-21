import {
  ProductEntity,
  ProductFileRelationEntity,
  ProductValueEntity,
} from 'src/entities/product';

type Product = {
  productValues?: Array<{
    field?: { id: string; order?: boolean };
    value?: string | number | null;
  }>;
};

function toSortableValue(v: any): {
  isNumber: boolean;
  num?: number;
  str: string;
} {
  if (v === null || v === undefined) return { isNumber: false, str: '' };

  const s = String(v).trim();
  if (!s) return { isNumber: false, str: '' };

  // Try numeric conversion (supports "12", "12.5", "  1,234 " etc.)
  const normalized = s.replace(/,/g, '');
  const n = Number(normalized);

  // Only treat as number if it’s a valid finite number AND string is number-like
  if (Number.isFinite(n) && /^-?\d+(\.\d+)?$/.test(normalized)) {
    return { isNumber: true, num: n, str: s };
  }

  return { isNumber: false, str: s.toLowerCase() };
}

function getOrderFieldId(products: Product[]): string | null {
  for (const p of products) {
    const pv = p.productValues ?? [];
    const found = pv.find((x) => x?.field?.order === true);
    if (found?.field?.id) return found.field.id;
  }
  return null;
}

function getProductOrderValue(product: Product, orderFieldId: string): any {
  const pv = product.productValues ?? [];
  return pv.find((x) => x?.field?.id === orderFieldId)?.value ?? null;
}

// Usage inside your class/service method
export function sortAndTransform(products: ProductEntity[]) {
  const orderFieldId = getOrderFieldId(products);

  if (!orderFieldId) {
    // no ordering field found, just transform
    return products.map((p) => this.transformProductDetailsFromRaw(p));
  }

  // Detect whether we should number-sort by checking if at least one value is numeric-like
  // (If you prefer: require ALL values numeric-like, change the logic.)
  const numericExists = products.some(
    (p) => toSortableValue(getProductOrderValue(p, orderFieldId)).isNumber,
  );

  products.sort((a, b) => {
    const avRaw = getProductOrderValue(a, orderFieldId);
    const bvRaw = getProductOrderValue(b, orderFieldId);

    const av = toSortableValue(avRaw);
    const bv = toSortableValue(bvRaw);

    // Keep null/empty at the end
    const aEmpty =
      avRaw === null || avRaw === undefined || String(avRaw).trim() === '';
    const bEmpty =
      bvRaw === null || bvRaw === undefined || String(bvRaw).trim() === '';
    if (aEmpty && bEmpty) return 0;
    if (aEmpty) return 1;
    if (bEmpty) return -1;

    if (numericExists) {
      // If one side isn't numeric, push non-numeric after numeric
      if (av.isNumber && bv.isNumber) return av.num! - bv.num!;
      if (av.isNumber) return -1;
      if (bv.isNumber) return 1;
      // fallback string
      return av.str.localeCompare(bv.str);
    }

    // Pure string sort
    return av.str.localeCompare(bv.str);
  });

  return products.map((p) => transformProductDetailsFromRaw(p));
}

export function transformProductDetailsFromRaw(
  product: ProductEntity & {
    productValues?: ProductValueEntity[];
    productFiles?: ProductFileRelationEntity[];
  },
) {
  // 1️⃣ Group fields by groupName

  //console.log(product);
  const groupedFields: Record<
    string,
    {
      serialNo: number;
      fieldId: string;
      fieldName: string;
      valueId: string;
      value: string;
      order: boolean;
      filter: boolean;
    }[]
  > = {};
  (product?.productValues || []).forEach((pv) => {
    const groupName = pv?.field?.group?.groupName;
    if (!groupedFields[groupName]) groupedFields[groupName] = [];
    groupedFields[groupName].push({
      serialNo: pv?.field?.serialNo,
      fieldId: pv?.field?.id,
      fieldName: pv?.field?.fieldName,
      valueId: pv?.id ?? null,
      value: pv?.value ?? null,
      order: pv?.field?.order ?? false,
      filter: pv?.field?.filter ?? false,
    });
  });

  Object.keys(groupedFields).forEach((groupName) => {
    groupedFields[groupName].sort((a, b) => a.serialNo - b.serialNo);
  });
  // console.log({ groupedFields });
  // 2️⃣ Extract files
  const files = (product.productFiles || []).map((pf) => pf.file);

  return {
    id: product?.id,
    serialNo: product?.serialNo,
    modelName: product?.modelName,
    description: product?.description,
    category: product?.category,
    subCategory: product?.subCategory,
    group: groupedFields,
    files,
  };
}

type FieldValueResult =
  | { type: 'range'; min: number; max: number }
  | { type: 'list'; values: string[] };

export function analyzeFieldValues(values: string[]): FieldValueResult {
  const cleaned = values.filter(
    (v) => v !== null && v !== undefined && v !== '',
  );

  const numericValues: number[] = [];

  for (const v of cleaned) {
    const num = Number(v);
    if (Number.isNaN(num)) {
      return { type: 'list', values: cleaned };
    }
    numericValues.push(num);
  }

  const uniqueNumbers = [...new Set(numericValues)];

  if (uniqueNumbers.length > 5) {
    return {
      type: 'range',
      min: Math.min(...uniqueNumbers),
      max: Math.max(...uniqueNumbers),
    };
  }

  return {
    type: 'list',
    values: cleaned,
  };
}
