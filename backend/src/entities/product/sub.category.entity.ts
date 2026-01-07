import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { CategoryEntity } from './category.entity';

@Entity('sub_category')
@Unique('UQ_sub_category_name_category', ['subCategoryName', 'category'])
export class SubCategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  subCategoryName: string;

  @ManyToOne(() => CategoryEntity, (category) => category.subCategories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

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
