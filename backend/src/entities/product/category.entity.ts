import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CategoryInfoEntity } from './category.info.entity';
import { CategoryFileRelationEntity } from './category.file.reation.entity';

@Entity('category')
export class CategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true, name: 'category_name' })
  categoryName: string;

  @Column({ type: 'text', nullable: false })
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

  @OneToMany(() => CategoryInfoEntity, (info) => info.category, {
    cascade: true,
  })
  categoryInfo: CategoryInfoEntity[];

  @OneToMany(() => CategoryFileRelationEntity, (rel) => rel.category, {
    cascade: true,
  })
  categoryFiles: CategoryFileRelationEntity[];

  products?: Record<string, any[]>;
}
