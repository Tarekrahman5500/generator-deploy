import {
  ProductEntity,
  ProductFileRelationEntity,
  ProductValueEntity,
} from 'src/entities/product';

type SortKey =
  | { kind: 'empty' }
  | { kind: 'num'; a: number }
  | { kind: 'pair'; a: number; b: number } // A/B
  | { kind: 'range'; a: number; b: number } // A-B as (min,max)
  | { kind: 'str'; s: string };

function parseNumberLoose(input: string): number | null {
  const normalized = input.trim().replace(/,/g, '');
  if (!normalized) return null;
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function toSortKey(v: any): SortKey {
  if (v === null || v === undefined) return { kind: 'empty' };

  const sRaw = String(v).trim();
  if (!sRaw) return { kind: 'empty' };

  // A/B (supports spaces)
  const slashParts = sRaw.split('/').map((x) => x.trim());
  if (slashParts.length === 2) {
    const a = parseNumberLoose(slashParts[0]);
    const b = parseNumberLoose(slashParts[1]);
    if (a !== null && b !== null) return { kind: 'pair', a, b };
  }

  // A-B (range; supports spaces) - also handles 50-30 -> (30,50)
  const dashParts = sRaw.split('-').map((x) => x.trim());
  if (dashParts.length === 2) {
    const x = parseNumberLoose(dashParts[0]);
    const y = parseNumberLoose(dashParts[1]);
    if (x !== null && y !== null) {
      return { kind: 'range', a: Math.min(x, y), b: Math.max(x, y) };
    }
  }

  // plain number
  const n = parseNumberLoose(sRaw);
  if (n !== null) return { kind: 'num', a: n };

  return { kind: 'str', s: sRaw.toLowerCase() };
}

function compareSortKeys(a: SortKey, b: SortKey): number {
  // empty last
  if (a.kind === 'empty' && b.kind === 'empty') return 0;
  if (a.kind === 'empty') return 1;
  if (b.kind === 'empty') return -1;

  // numeric-like before strings (stable rule)
  const rank = (k: SortKey) => {
    switch (k.kind) {
      case 'num':
        return 0;
      case 'pair':
        return 1;
      case 'range':
        return 2;
      case 'str':
        return 3;
      default:
        return 4;
    }
  };

  const ra = rank(a);
  const rb = rank(b);
  if (ra !== rb) return ra - rb;

  // same-kind compares
  if (a.kind === 'num' && b.kind === 'num') return a.a - b.a;

  // pair: sort by first number then second
  if (a.kind === 'pair' && b.kind === 'pair') {
    if (a.a !== b.a) return a.a - b.a;
    return a.b - b.b;
  }

  // range: sort by min then max
  if (a.kind === 'range' && b.kind === 'range') {
    if (a.a !== b.a) return a.a - b.a;
    return a.b - b.b;
  }

  if (a.kind === 'str' && b.kind === 'str') return a.s.localeCompare(b.s);

  return 0;
}

type Product = {
  productValues?: Array<{
    field?: { id: string; order?: boolean };
    value?: string | number | null;
  }>;
};

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
    return products.map((p) => transformProductDetailsFromRaw(p));
  }

  products.sort((a, b) => {
    const avRaw = getProductOrderValue(a, orderFieldId);
    const bvRaw = getProductOrderValue(b, orderFieldId);

    const ak = toSortKey(avRaw);
    const bk = toSortKey(bvRaw);

    return compareSortKeys(ak, bk);
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

  const groupMetadata = new Map<string, number>();
  (product?.productValues || []).forEach((pv) => {
    const group = pv?.field?.group;
    if (group && !groupMetadata.has(group.groupName)) {
      groupMetadata.set(group.groupName, group.serialNo || 0);
    }
  });

  // 2. Sort the group names by their serialNo
  const sortedGroupNames = Array.from(groupMetadata.keys()).sort((a, b) => {
    return (groupMetadata.get(a) || 0) - (groupMetadata.get(b) || 0);
  });

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

  sortedGroupNames.forEach((name) => {
    groupedFields[name] = [];
  });
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
