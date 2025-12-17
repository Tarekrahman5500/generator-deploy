import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductEntity } from './product.entity';
import { FieldEntity } from './field.entity';

@Entity('product_value')
export class ProductValueEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // FIXED: Proper relation to ProductEntity
  @ManyToOne(() => ProductEntity, (product) => product.productValues, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' }) // Correct column name
  product: ProductEntity; // Correct property name

  // FIXED: Proper relation to FieldEntity
  @ManyToOne(() => FieldEntity, (field) => field.productValues, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'field_id' }) // Correct column name
  field: FieldEntity; // Correct property name

  @Column({ type: 'varchar', length: 255 })
  value: string;

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
