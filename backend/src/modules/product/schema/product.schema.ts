import { z } from 'zod';
import {
  dieselGeneratorSetSchema,
  dieselGeneratorSetUpdateSchema,
} from './diesel.generator.set.schema';
import { compressorSchema, compressorUpdateSchema } from './compressor.schema';
import { forkliftSchema, forkliftUpdateSchema } from './forklift.schema';
import { towerLightSchema, towerLightUpdateSchema } from './tower.light.schema';
import { upsSchema, upsUpdateSchema } from './ups.schema';
import {
  automaticTransferSwitchSchema,
  automaticTransferSwitchUpdateSchema,
} from './automatic.transfer.switch.schema';
import {
  distributorPanelSchema,
  distributorPanelUpdateSchema,
} from './distributor.panel.schema';
import { Categories } from 'src/common/enums';

export type ProductSchemaType = z.infer<typeof productSchema>;

export const productSchema = z.discriminatedUnion('type', [
  dieselGeneratorSetSchema,
  compressorSchema,
  forkliftSchema,
  towerLightSchema,
  upsSchema,
  automaticTransferSwitchSchema,
  distributorPanelSchema,
]);

export const productUpdateSchema = z.discriminatedUnion('type', [
  dieselGeneratorSetUpdateSchema,
  compressorUpdateSchema,
  forkliftUpdateSchema,
  towerLightUpdateSchema,
  upsUpdateSchema,
  automaticTransferSwitchUpdateSchema,
  distributorPanelUpdateSchema,
]);

export const productSoftDeleteSchema = z
  .object({
    id: z.uuidv4(),
    type: z.enum(Object.values(Categories)),
  })
  .strict();
