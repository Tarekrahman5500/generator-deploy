import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CategoryFileRelationEntity } from './category.file.reation.entity';
import { GroupEntity } from 'src/entities/product/group.entity';
import { SubCategoryEntity } from './sub.category.entity';

@Entity('category')
export class CategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: true, unique: true })
  serialNo: number | null;

  @Column({ type: 'varchar', length: 100, unique: true, name: 'category_name' })
  categoryName: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_deleted',
  })
  isDeleted: boolean;

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

  @OneToMany(() => CategoryFileRelationEntity, (rel) => rel.category, {
    cascade: true,
  })
  categoryFiles: CategoryFileRelationEntity[];

  @OneToMany(() => GroupEntity, (group) => group.category)
  groups: GroupEntity[]; // Add this

  @OneToMany(() => SubCategoryEntity, (sub) => sub.category)
  subCategories: SubCategoryEntity[];
}
