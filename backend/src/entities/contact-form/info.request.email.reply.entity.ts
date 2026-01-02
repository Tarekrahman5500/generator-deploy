// src/entities/info-request/info.request.email.reply.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { InfoRequestFormEntity } from './info.request.form.entity';
import { InfoRequestEmailReplyFileRelationEntity } from './info.request.email.reply.file.relation.entity';
import { Administrator } from '../administrator/administrator.entity';

@Entity('info_request_email_replies')
export class InfoRequestEmailReplyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ======================
  // INFO REQUEST FORM
  // ======================
  @ManyToOne(() => InfoRequestFormEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'info_request_form_id' })
  infoRequestForm: InfoRequestFormEntity;

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
    () => InfoRequestEmailReplyFileRelationEntity,
    (rel) => rel.reply,
    { cascade: true },
  )
  files: InfoRequestEmailReplyFileRelationEntity[];

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
