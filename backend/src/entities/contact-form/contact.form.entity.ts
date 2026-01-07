import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ContactFormEmailReplyEntity } from './contact.form.email.reply.entity';

@Entity('contact_forms')
export class ContactFormEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name', type: 'varchar' })
  fullName: string;

  @Column({ type: 'varchar' })
  company: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  telephone: string;

  @Column({ type: 'varchar' })
  country: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'boolean', default: false })
  isReplied: boolean;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'updated_at',
  })
  updatedAt: Date;

  @OneToMany(() => ContactFormEmailReplyEntity, (reply) => reply.contactForm)
  emailReplies: ContactFormEmailReplyEntity[];
}
