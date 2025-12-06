import { z } from 'zod';
import {
  IpRating,
  SwitchType,
  BreakerType,
  VoltageUnit,
  Categories,
} from '../../../common/enums';
import { baseProductSchema, noCodeDescription } from '../../../common/schema';

export const distributorPanelSchema = baseProductSchema.extend({
  type: z.literal(Categories.DISTRIBUTOR_PANEL),
  description: noCodeDescription,
  modelName: z.string(),
  numberOfWays: z.number(),
  ampereRatingA: z.number(),
  ipRating: z.enum(Object.values(IpRating) as [string, ...string[]]),
  mainSwitchType: z.enum(Object.values(SwitchType) as [string, ...string[]]),
  circuitBreakerType: z.enum(
    Object.values(BreakerType) as [string, ...string[]],
  ),
  voltageUnit: z.enum(Object.values(VoltageUnit) as [string, ...string[]]),
  fileIds: z.array(z.string().uuid()).min(1),
});

export const distributorPanelUpdateSchema = distributorPanelSchema
  .partial()
  .extend({
    id: z.uuid(),
    type: z.literal(Categories.DISTRIBUTOR_PANEL),
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
// Correctly infer TypeScript type
export type DistributorPanelType = z.infer<typeof distributorPanelSchema>;
