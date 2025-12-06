import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { CategoryEntity } from './category.entity';
import { SwitchingType } from '../../common/enums';
import { AutomaticTransferSwitchFileRelationEntity } from './automatic.transfer.switch.file.relation.entity';

@Entity('automatic_transfer_switch')
export class AutomaticTransferSwitchEntity {
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

  @Column({ name: 'current_rating_a', type: 'int' })
  currentRatingA: number;

  @Column({ name: 'number_of_poles', type: 'int' })
  numberOfPoles: number;

  @Column({ name: 'transfer_time_ms', type: 'int' })
  transferTimeMs: number;

  @Column({ name: 'operating_voltage', type: 'int' })
  operatingVoltage: number;

  @Column({ name: 'switching_type', type: 'enum', enum: SwitchingType })
  switchingType: SwitchingType;

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

  // ✅ Add this relation
  @OneToMany(
    () => AutomaticTransferSwitchFileRelationEntity,
    (relation) => relation.automaticTransferSwitch,
  )
  fileRelations: AutomaticTransferSwitchFileRelationEntity[];
}
