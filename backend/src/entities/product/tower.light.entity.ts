import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { CategoryEntity } from './category.entity';
import {
  MastTypeTower,
  PowerSourceTower,
  TrailerType,
} from '../../common/enums';
import { TowerLightFileRelationEntity } from './tower.light.file.relation.entity';

@Entity('tower_light')
export class TowerLightEntity {
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

  @Column({ name: 'mast_height_m', type: 'int' })
  mastHeightM: number;

  @Column({ name: 'lamp_count', type: 'int' })
  lampCount: number;

  @Column({ name: 'lamp_power_watt', type: 'int' })
  lampPowerWatt: number;

  @Column({ name: 'mast_type', type: 'enum', enum: MastTypeTower })
  mastType: MastTypeTower;

  @Column({ name: 'power_source', type: 'enum', enum: PowerSourceTower })
  powerSource: PowerSourceTower;

  @Column({ name: 'trailer_type', type: 'enum', enum: TrailerType })
  trailerType: TrailerType;

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
  @OneToMany(() => TowerLightFileRelationEntity, (rel) => rel.towerLight)
  fileRelations: TowerLightFileRelationEntity[];
}
