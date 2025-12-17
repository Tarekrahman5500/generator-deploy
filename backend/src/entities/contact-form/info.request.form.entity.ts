import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductEntity } from '../product';

@Entity('info_request_forms')
export class InfoRequestFormEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name', type: 'varchar' })
  fullName: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  telephone: string;

  @Column({ type: 'varchar' })
  country: string;

  // ✅ PROPER FOREIGN KEY RELATION
  @ManyToOne(() => ProductEntity, (product) => product.infoRequestForms, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: Date;
}
