export interface Field {
  id: string;
  fieldName: string;
}

export interface ProductGroup {
  id: string;
  groupName: string;
  fields: Field[];
}
