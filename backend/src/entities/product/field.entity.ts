import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { GroupEntity } from './group.entity';
import { ProductValueEntity } from 'src/entities/product/product.value.entity';
@Entity('field')
export class FieldEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, name: 'field_name' })
  fieldName: string;

  @ManyToOne(() => GroupEntity, (group) => group.fields, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'group_id' })
  group: GroupEntity;

  // ADD this inverse relation for ProductValueEntity
  @OneToMany(() => ProductValueEntity, (productValue) => productValue.field)
  productValues: ProductValueEntity[];

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
