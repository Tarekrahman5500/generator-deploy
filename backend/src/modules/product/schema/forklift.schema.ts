import { z } from 'zod';
import {
  MastTypeForklift,
  PowerSourceForklift,
  TireType,
  Categories,
} from '../../../common/enums/product.enum';
import { baseProductSchema, noCodeDescription } from '../../../common/schema';

export const forkliftSchema = baseProductSchema.extend({
  type: z.literal(Categories.FORKLIFT),
  description: noCodeDescription,
  modelName: z.string(),
  loadCapacityKg: z.number(),
  maxLiftHeightM: z.number(),
  mastType: z.enum(Object.values(MastTypeForklift) as [string, ...string[]]),
  powerSource: z.enum(
    Object.values(PowerSourceForklift) as [string, ...string[]],
  ),
  tireType: z.enum(Object.values(TireType) as [string, ...string[]]),
  turningRadiusM: z.number(),
  fileIds: z.array(z.string().uuid()).min(1),
});

export const forkliftUpdateSchema = forkliftSchema
  .partial()
  .extend({
    id: z.uuid(),
    type: z.literal(Categories.FORKLIFT),
  })
  .superRefine((data, ctx) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, type, ...others } = data;

    const hasUpdates = Object.values(others).some((v) => v !== undefined);

    if (!hasUpdates) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one field is required besides id and type.',
      });
    }
  });

// TypeScript type inference
export type ForkliftType = z.infer<typeof forkliftSchema>;
