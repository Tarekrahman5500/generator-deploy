import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { CategoryEntity } from './category.entity';
import { PowerSource, PumpType } from '../../common/enums';
import { CompressorFileRelationEntity } from './compressor.file.relation.entity';

@Entity('compressors')
export class CompressorEntity {
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

  @Column({ name: 'max_pressure_psi', type: 'int' })
  maxPressurePsi: number;

  @Column({ name: 'max_pressure_bar', type: 'double' })
  maxPressureBar: number;

  @Column({ name: 'flow_rate_cfm', type: 'double' })
  flowRateCfm: number;

  @Column({ name: 'flow_rate_m3_min', type: 'double' })
  flowRateM3Min: number;

  @Column({ name: 'tank_capacity_l', type: 'int' })
  tankCapacityL: number;

  @Column({ name: 'power_source', type: 'enum', enum: PowerSource })
  powerSource: PowerSource;

  @Column({ name: 'stages', type: 'int' })
  stages: number;

  @Column({ name: 'pump_type', type: 'enum', enum: PumpType })
  pumpType: PumpType;

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
    () => CompressorFileRelationEntity,
    (relation) => relation.compressor,
  )
  fileRelations: CompressorFileRelationEntity[];
}
