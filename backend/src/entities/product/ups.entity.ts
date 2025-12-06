import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { CategoryEntity } from './category.entity';
import { Topology, BatteryType, VoltageUnit } from '../../common/enums';
import { UpsFileRelationEntity } from './ups.file.relation.entity';

@Entity('ups')
export class UpsEntity {
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

  @Column({ name: 'power_capacity_va', type: 'int' })
  powerCapacityVa: number;

  @Column({ name: 'power_capacity_watt', type: 'int' })
  powerCapacityWatt: number;

  @Column({ name: 'topology', type: 'enum', enum: Topology })
  topology: Topology;

  @Column({ name: 'backup_time_min', type: 'int' })
  backupTimeMin: number;

  @Column({ name: 'battery_type', type: 'enum', enum: BatteryType })
  batteryType: BatteryType;

  @Column({ name: 'outlet_count', type: 'int' })
  outletCount: number;

  @Column({ name: 'input_voltage_min', type: 'int' })
  inputVoltageMin: number;

  @Column({ name: 'input_voltage_max', type: 'int' })
  inputVoltageMax: number;

  @Column({ name: 'output_voltage', type: 'int' })
  outputVoltage: number;

  @Column({ name: 'voltage_unit', type: 'enum', enum: VoltageUnit })
  voltageUnit: VoltageUnit;

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
  @OneToMany(() => UpsFileRelationEntity, (rel) => rel.ups)
  fileRelations: UpsFileRelationEntity[];
}
