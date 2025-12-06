import { z } from 'zod';
import {
  Topology,
  BatteryType,
  VoltageUnit,
  Categories,
} from '../../../common/enums';
import { baseProductSchema, noCodeDescription } from '../../../common/schema';

export const upsSchema = baseProductSchema.extend({
  type: z.literal(Categories.UPS),
  description: noCodeDescription,
  modelName: z.string(),
  powerCapacityVa: z.number(),
  powerCapacityWatt: z.number(),
  topology: z.enum(Object.values(Topology) as [string, ...string[]]),
  backupTimeMin: z.number(),
  batteryType: z.enum(Object.values(BatteryType) as [string, ...string[]]),
  outletCount: z.number(),
  inputVoltageMin: z.number(),
  inputVoltageMax: z.number(),
  outputVoltage: z.number(),
  voltageUnit: z.enum(Object.values(VoltageUnit) as [string, ...string[]]),
  fileIds: z.array(z.string().uuid()).min(1),
});

export const upsUpdateSchema = upsSchema
  .partial()
  .extend({
    id: z.uuid(),
    type: z.literal(Categories.UPS),
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
export type UpsType = z.infer<typeof upsSchema>;
