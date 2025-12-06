import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CategoryEntity } from './category.entity';
import {
  MastTypeForklift,
  PowerSourceForklift,
  TireType,
} from '../../common/enums';
import { ForkliftFileRelationEntity } from './forklift.file.relation.entity';

@Entity('forklift')
export class ForkliftEntity {
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

  @Column({ name: 'load_capacity_kg', type: 'int' })
  loadCapacityKg: number;

  @Column({ name: 'max_lift_height_m', type: 'double' })
  maxLiftHeightM: number;

  @Column({ name: 'mast_type', type: 'enum', enum: MastTypeForklift })
  mastType: MastTypeForklift;

  @Column({ name: 'power_source', type: 'enum', enum: PowerSourceForklift })
  powerSource: PowerSourceForklift;

  @Column({ name: 'tire_type', type: 'enum', enum: TireType })
  tireType: TireType;

  @Column({ name: 'turning_radius_m', type: 'double' })
  turningRadiusM: number;

  @Column({ name: 'category_id', type: 'uuid', nullable: false })
  categoryId: string;

  @ManyToOne(() => CategoryEntity)
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @OneToMany(() => ForkliftFileRelationEntity, (rel) => rel.forklift)
  fileRelations: ForkliftFileRelationEntity[];

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
}
