import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { InfoRequestEmailReplyEntity } from './info.request.email.reply.entity';
import { FileEntity } from '../file/file.entity';

@Entity('info_request_email_reply_files')
export class InfoRequestEmailReplyFileRelationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ======================
  // EMAIL REPLY
  // ======================
  @ManyToOne(() => InfoRequestEmailReplyEntity, (reply) => reply.files, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reply_id' })
  reply: InfoRequestEmailReplyEntity;

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
