import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { CategoryEntity } from './category.entity';
import { CategoryInfoFileRelationEntity } from './category.info.file.relation.entity';

@Entity('category_info')
export class CategoryInfoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

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

  @Column({ type: 'uuid', name: 'category_id', nullable: false })
  categoryId: string;

  @ManyToOne(() => CategoryEntity, (category) => category.categoryInfo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @OneToMany(
    () => CategoryInfoFileRelationEntity,
    (rel) => rel.categoryInfo,
    { cascade: true },
  )
  categoryInfoFiles: CategoryInfoFileRelationEntity[];
}
