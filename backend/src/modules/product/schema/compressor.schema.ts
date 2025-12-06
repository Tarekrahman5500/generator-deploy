import { z } from 'zod';
import { Categories, PowerSource, PumpType } from '../../../common/enums';
import { baseProductSchema, noCodeDescription } from '../../../common/schema';

export const compressorSchema = baseProductSchema.extend({
  type: z.literal(Categories.COMPRESSOR),
  description: noCodeDescription,
  modelName: z.string().min(1).max(255),
  maxPressurePsi: z.number().int(),
  maxPressureBar: z.number(),
  flowRateCfm: z.number(),
  flowRateM3Min: z.number(),
  tankCapacityL: z.number().int(),
  powerSource: z.enum(Object.values(PowerSource) as [string, ...string[]]),
  stages: z.number().int(),
  pumpType: z.enum(Object.values(PumpType) as [string, ...string[]]),
  fileIds: z.array(z.string().uuid()).min(1),
});

export const compressorUpdateSchema = compressorSchema
  .partial()
  .extend({
    id: z.string().uuid(),
    type: z.literal(Categories.COMPRESSOR),
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
