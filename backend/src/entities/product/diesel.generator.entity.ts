import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { CategoryEntity } from './category.entity';
import { VoltageUnit } from '../../common/enums';
import { DieselGeneratorFileRelationEntity } from './diesel.generator.file.relation.entity';

@Entity('diesel_generator_sets')
export class DieselGeneratorSetEnitiy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'type', type: 'varchar' })
  type: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ name: 'model_name', type: 'varchar', unique: true })
  modelName: string;

  @Column({ name: 'power_output_kva', type: 'double' })
  powerOutputKva: number;

  @Column({ name: 'power_output_kw', type: 'double' })
  powerOutputKw: number;

  @Column({ name: 'frequency_hz', type: 'int' })
  frequencyHz: number;

  @Column({ name: 'voltage_min', type: 'int' })
  voltageMin: number;

  @Column({ name: 'voltage_max', type: 'int' })
  voltageMax: number;

  @Column({
    name: 'voltage_unit',
    type: 'enum',
    enum: VoltageUnit,
  })
  voltageUnit: VoltageUnit;

  @Column({ name: 'fuel_tank_capacity_liters', type: 'int' })
  fuelTankCapacityLiters: number;

  @Column({ name: 'fuel_consumption_l_per_hr', type: 'int' })
  fuelConsumptionLPerHr: number;

  @Column({ name: 'noise_level_db', type: 'int' })
  noiseLevelDb: number;

  @Column({ name: 'engine_mode', type: 'varchar' })
  engineMode: string;

  @Column({ type: 'int' })
  cylinders: number;

  @Column({ name: 'displacement_cc', type: 'int' })
  displacementCc: number;

  @Column({ type: 'varchar' })
  aspiration: string;

  @Column({ name: 'alternator_brand', type: 'varchar' })
  alternatorBrand: string;

  @Column({ name: 'alternator_model', type: 'varchar' })
  alternatorModel: string;

  @Column({ name: 'alternator_insulation_class', type: 'varchar' })
  alternatorInsulationClass: string;

  @Column({ type: 'int' })
  length: number;

  @Column({ type: 'int' })
  width: number;

  @Column({ type: 'int' })
  height: number;

  @Column({ name: 'weight_kg', type: 'int' })
  weightKg: number;

  @Column({ name: 'category_id', type: 'uuid', nullable: false })
  categoryId: string;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    name: 'updated_at',
  })
  updatedAt: Date;

  @ManyToOne(() => CategoryEntity)
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  // ✅ Add file relations
  @OneToMany(
    () => DieselGeneratorFileRelationEntity,
    (relation) => relation.dieselGenerator,
  )
  fileRelations: DieselGeneratorFileRelationEntity[];
}
