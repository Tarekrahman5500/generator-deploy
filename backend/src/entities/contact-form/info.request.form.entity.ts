import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ProductEntity } from '../product';
import { InfoRequestEmailReplyEntity } from './info.request.email.reply.entity';

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

  @Column({ type: 'boolean', default: false })
  isReplied: boolean;

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

  @OneToMany(
    () => InfoRequestEmailReplyEntity,
    (reply) => reply.infoRequestForm,
  )
  emailReplies: InfoRequestEmailReplyEntity[];
}
