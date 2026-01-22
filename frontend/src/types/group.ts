export interface Field {
  serialNo?: number;
  id: string;
  fieldName: string;
  order: boolean; // Toggle 1
  filter: boolean; // Toggle 2
}

export interface ProductGroup {
  serialNo?: number;
  id: string;
  groupName: string;
  fields: Field[];
}
