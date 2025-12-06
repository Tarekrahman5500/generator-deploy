import { z } from 'zod';
import { VoltageUnit, Categories } from '../../../common/enums';
import { baseProductSchema, noCodeDescription } from '../../../common/schema';

export const dieselGeneratorSetSchema = baseProductSchema.extend({
  type: z.literal(Categories.DIESEL_GENERATOR),
  description: noCodeDescription,
  modelName: z.string(),
  powerOutputKva: z.number(),
  powerOutputKw: z.number(),
  frequencyHz: z.number(),
  voltageMin: z.number(),
  voltageMax: z.number(),
  voltageUnit: z.enum(Object.values(VoltageUnit) as [string, ...string[]]),
  fuelTankCapacityLiters: z.number(),
  fuelConsumptionLPerHr: z.number(),
  noiseLevelDb: z.number(),
  engineMode: z.string(),
  cylinders: z.number(),
  displacementCc: z.number(),
  aspiration: z.string(),
  alternatorBrand: z.string(),
  alternatorModel: z.string(),
  alternatorInsulationClass: z.string(),
  length: z.number(),
  width: z.number(),
  height: z.number(),
  weightKg: z.number(),
  fileIds: z.array(z.string().uuid()).min(1),
});

export const dieselGeneratorSetUpdateSchema = dieselGeneratorSetSchema
  .partial()
  .extend({
    id: z.uuid(),
    type: z.literal(Categories.DIESEL_GENERATOR),
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
