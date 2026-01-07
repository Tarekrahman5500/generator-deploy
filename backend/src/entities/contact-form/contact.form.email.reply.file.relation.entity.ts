import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ContactFormEmailReplyEntity } from './contact.form.email.reply.entity';
import { FileEntity } from '../file/file.entity';

@Entity('contact_form_email_reply_files')
export class ContactFormEmailReplyFileRelationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ======================
  // EMAIL REPLY
  // ======================
  @ManyToOne(() => ContactFormEmailReplyEntity, (reply) => reply.files, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reply_id' })
  reply: ContactFormEmailReplyEntity;

  // ======================
  // FILE
  // ======================
  @ManyToOne(() => FileEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'file_id' })
  file: FileEntity;
}
