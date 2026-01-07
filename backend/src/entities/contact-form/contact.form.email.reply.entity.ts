import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ContactFormEntity } from './contact.form.entity';
import { ContactFormEmailReplyFileRelationEntity } from './contact.form.email.reply.file.relation.entity';
import { Administrator } from '../administrator/administrator.entity';

@Entity('contact_form_email_replies')
export class ContactFormEmailReplyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ======================
  // CONTACT FORM
  // ======================
  @ManyToOne(() => ContactFormEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'contact_form_id' })
  contactForm: ContactFormEntity;

  // ======================
  // ADMIN WHO REPLIED
  // ======================
  @ManyToOne(() => Administrator, {
    nullable: false,
  })
  @JoinColumn({ name: 'administrator_id' })
  repliedBy: Administrator;

  // ======================
  // EMAIL CONTENT
  // ======================
  @Column({ type: 'varchar', length: 200 })
  subject: string;

  @Column({ type: 'text' })
  body: string;

  // ======================
  // ATTACHMENTS
  // ======================
  @OneToMany(
    () => ContactFormEmailReplyFileRelationEntity,
    (rel) => rel.reply,
    { cascade: true },
  )
  files: ContactFormEmailReplyFileRelationEntity[];

  // ======================
  // META
  // ======================
  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: Date;
}
