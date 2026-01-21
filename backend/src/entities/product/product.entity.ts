import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { CategoryEntity } from './category.entity';
import { SubCategoryEntity } from './sub.category.entity';
import { ProductFileRelationEntity } from 'src/entities/product/product.file.relation.entity';
import { ProductValueEntity } from 'src/entities/product/product.value.entity';
import { InfoRequestFormEntity } from '../contact-form';

@Index('idx_product_category_id', ['category'])
@Entity('product')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: true })
  serialNo: number;

  @ManyToOne(() => CategoryEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  // ======================
  // SUB CATEGORY (OPTIONAL)
  // ======================
  @ManyToOne(() => SubCategoryEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'sub_category_id' })
  subCategory: SubCategoryEntity | null;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'varchar',
    length: 150,
    name: 'model_name',
  })
  modelName: string;

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

  // ======================
  // RELATIONS
  // ======================
  @OneToMany(() => ProductFileRelationEntity, (pf) => pf.product)
  productFiles: ProductFileRelationEntity[];

  @OneToMany(() => ProductValueEntity, (pv) => pv.product)
  productValues: ProductValueEntity[];

  @OneToMany(() => InfoRequestFormEntity, (info) => info.product)
  infoRequestForms: InfoRequestFormEntity[];
}
