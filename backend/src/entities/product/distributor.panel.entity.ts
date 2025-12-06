import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { CategoryEntity } from './category.entity';
import { IpRating, SwitchType, BreakerType } from '../../common/enums';
import { DistributorPanelFileRelationEntity } from './distributor.panel.file.relation.entity';

@Entity('distributor_panels')
export class DistributorPanelEntity {
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

  @Column({ name: 'number_of_ways', type: 'int' })
  numberOfWays: number;

  @Column({ name: 'ampere_rating_a', type: 'int' })
  ampereRatingA: number;

  @Column({ name: 'ip_rating', type: 'enum', enum: IpRating })
  ipRating: IpRating;

  @Column({ name: 'main_switch_type', type: 'enum', enum: SwitchType })
  mainSwitchType: SwitchType;

  @Column({ name: 'circuit_breaker_type', type: 'enum', enum: BreakerType })
  circuitBreakerType: BreakerType;

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
    () => DistributorPanelFileRelationEntity,
    (rel) => rel.distributorPanel,
  )
  fileRelations: DistributorPanelFileRelationEntity[];
}
