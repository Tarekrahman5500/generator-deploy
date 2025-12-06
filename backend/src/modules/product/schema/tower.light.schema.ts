import { z } from 'zod';
import {
  MastTypeTower,
  PowerSourceTower,
  TrailerType,
  Categories,
} from '../../../common/enums';
import { baseProductSchema, noCodeDescription } from '../../../common/schema';

export const towerLightSchema = baseProductSchema.extend({
  type: z.literal(Categories.TOWER_LIGHT),
  description: noCodeDescription,
  modelName: z.string(),
  mastHeightM: z.number(),
  lampCount: z.number(),
  lampPowerWatt: z.number(),
  mastType: z.enum(Object.values(MastTypeTower) as [string, ...string[]]),
  powerSource: z.enum(Object.values(PowerSourceTower) as [string, ...string[]]),
  trailerType: z.enum(Object.values(TrailerType) as [string, ...string[]]),
  fileIds: z.array(z.uuid()).min(1),
});

export const towerLightUpdateSchema = towerLightSchema
  .partial()
  .extend({
    id: z.uuid(),
    type: z.literal(Categories.TOWER_LIGHT),
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
export type TowerLightType = z.infer<typeof towerLightSchema>;
