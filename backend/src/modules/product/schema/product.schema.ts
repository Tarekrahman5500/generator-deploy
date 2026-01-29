import z from 'zod';

const productValueSchema = z.object({
  fieldId: z.uuid(),
  value: z.string().min(1),
});

export const productSchema = z.object({
  id: z.uuidv4({
    message: 'Invalid product ID format',
  }),

  serialNo: z
    .number({ message: 'Serial number must be a positive number' })
    .nullable()
    .optional(),

  categoryId: z.uuidv4({
    message: 'Invalid category ID format',
  }),

  subCategoryId: z
    .uuidv4({
      message: 'Invalid sub-category ID format',
    })
    .optional(),

  modelName: z
    .string()
    .min(1, 'Model name must be at least 1 characters')
    .max(100, 'Model name must not exceed 100 characters'),

  description: z.string({ message: 'Description is required' }),

  information: z
    .array(productValueSchema)
    .min(1, 'At least one product information entry is required'),

  fileIds: z.array(
    z.uuidv4({
      message: 'Invalid file ID format',
    }),
  ),
});

export const createProductSchema = productSchema.omit({ id: true });
export const updateProductSchema = productSchema.partial().refine(
  (data) => {
    return Object.entries(data).some(
      ([key, value]) => key !== 'id' && value !== undefined,
    );
  },
  {
    message: "At least one field other than 'id' must be provided.",
  },
);

// create product with group and category

export const groupFieldsSchema = z.object({
  fieldName: z.string(),
  value: z.string().min(1),
});

export const informationSchema = z
  .array(groupFieldsSchema)
  .optional()
  .refine(
    (arr) => {
      if (!arr) return true; // optional → skip validation
      const names = arr.map((i) => i.fieldName);
      return names.length === new Set(names).size;
    },
    {
      message: 'Each fieldName must be unique',
      path: ['information'],
    },
  );

export const groupProductSchema = z.object({
  modelName: z.string().min(5).max(100),
  description: z.string().min(100).optional(),
  fileIds: z.array(z.uuid().min(1)),
  information: informationSchema,
});

export const productCreateGroupSchema = z.object({
  categoryId: z.uuid(),
  groupName: z.string(),
  product: groupProductSchema.optional(),
});

export const productCompareScheme = z.object({
  productIds: z
    .array(z.uuidv4())
    .min(2, 'At least two product IDs are required for comparison')
    .refine(
      (ids) => new Set(ids).size === ids.length,
      'Product IDs must be unique',
    ),
});

export const productUpsertSchema = productSchema
  .pick({
    id: true,
    serialNo: true,
    modelName: true,
    description: true,
    fileIds: true,
  })
  .partial({
    serialNo: true,
    modelName: true,
    description: true,
    fileIds: true,
  })
  .extend({
    information: z.array(productValueSchema).optional(),
  })
  .strict();

export const bulkDeleteProductSchema = z.object({
  ids: z
    .array(z.uuid({ message: 'Each product ID must be a valid UUID' }))
    .min(1, 'At least one product ID must be provided for deletion'),
});
