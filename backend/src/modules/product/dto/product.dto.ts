import { createZodDto } from 'nestjs-zod';
import {
  automaticTransferSwitchSchema,
  automaticTransferSwitchUpdateSchema,
  compressorSchema,
  compressorUpdateSchema,
  dieselGeneratorSetSchema,
  dieselGeneratorSetUpdateSchema,
  distributorPanelSchema,
  distributorPanelUpdateSchema,
  forkliftSchema,
  forkliftUpdateSchema,
  productSoftDeleteSchema,
  towerLightSchema,
  towerLightUpdateSchema,
  upsSchema,
  upsUpdateSchema,
} from '../schema';

// Create individual DTOs
export class DieselGeneratorDto extends createZodDto(
  dieselGeneratorSetSchema,
) {}
export class CompressorDto extends createZodDto(compressorSchema) {}
export class ForkliftDto extends createZodDto(forkliftSchema) {}
export class TowerLightDto extends createZodDto(towerLightSchema) {}
export class UpsDto extends createZodDto(upsSchema) {}
export class AutomaticTransferSwitchDto extends createZodDto(
  automaticTransferSwitchSchema,
) {}
export class DistributorPanelDto extends createZodDto(distributorPanelSchema) {}

// Union type for service method
export type ProductDto =
  | DieselGeneratorDto
  | CompressorDto
  | ForkliftDto
  | TowerLightDto
  | UpsDto
  | AutomaticTransferSwitchDto
  | DistributorPanelDto;

// Update DTOs
export class DieselGeneratorUpdateDto extends createZodDto(
  dieselGeneratorSetUpdateSchema,
) {}

export class CompressorUpdateDto extends createZodDto(compressorUpdateSchema) {}
export class ForkliftUpdateDto extends createZodDto(forkliftUpdateSchema) {}
export class TowerLightUpdateDto extends createZodDto(towerLightUpdateSchema) {}
export class UpsUpdateDto extends createZodDto(upsUpdateSchema) {}
export class AutomaticTransferSwitchUpdateDto extends createZodDto(
  automaticTransferSwitchUpdateSchema,
) {}
export class DistributorPanelUpdateDto extends createZodDto(
  distributorPanelUpdateSchema,
) {}

export type ProductUpdateDto =
  | DieselGeneratorUpdateDto
  | CompressorUpdateDto
  | ForkliftUpdateDto
  | TowerLightUpdateDto
  | UpsUpdateDto
  | AutomaticTransferSwitchUpdateDto
  | DistributorPanelUpdateDto;

export class ProductSoftDeleteDto extends createZodDto(
  productSoftDeleteSchema,
) {}
