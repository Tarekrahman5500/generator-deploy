import { z } from 'zod';
import { Categories, SwitchingType } from '../../../common/enums';
import { baseProductSchema, noCodeDescription } from '../../../common/schema';

export const automaticTransferSwitchSchema = baseProductSchema.extend({
  type: z.literal(Categories.AUTOMATIC_TRANSFER_SWITCH),
  description: noCodeDescription,
  modelName: z.string(),
  currentRatingA: z.number(),
  numberOfPoles: z.number(),
  transferTimeMs: z.number(),
  operatingVoltage: z.number(),
  switchingType: z.enum(Object.values(SwitchingType) as [string, ...string[]]),
  fileIds: z.array(z.uuid()).min(1),
});

export const automaticTransferSwitchUpdateSchema = automaticTransferSwitchSchema
  .partial()
  .extend({
    id: z.uuid(),
    type: z.literal(Categories.AUTOMATIC_TRANSFER_SWITCH),
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
