import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AdministratorRole } from '../../common/enums';
import {
  ContactFormEmailReplyEntity,
  InfoRequestEmailReplyEntity,
} from '../contact-form';
@Entity('administrators')
export class Administrator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  phone: string;

  @Column({ type: 'varchar' })
  userName: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'enum', enum: AdministratorRole })
  role: AdministratorRole;

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

  @OneToMany(() => ContactFormEmailReplyEntity, (reply) => reply.repliedBy)
  emailReplies: ContactFormEmailReplyEntity[];

  @OneToMany(() => InfoRequestEmailReplyEntity, (reply) => reply.repliedBy)
  infoRequestEmailReplies: InfoRequestEmailReplyEntity[];
}
