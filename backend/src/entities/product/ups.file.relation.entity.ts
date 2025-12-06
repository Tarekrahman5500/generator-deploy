import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { UpsEntity } from './ups.entity';
import { FileEntity } from '../file';

@Entity('ups_file_relation')
export class UpsFileRelationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UpsEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ups_id' })
  ups: UpsEntity;

  @Column({ type: 'uuid', name: 'ups_id' })
  upsId: string;

  @ManyToOne(() => FileEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'file_id' })
  file: FileEntity;

  @Column({ type: 'uuid', name: 'file_id' })
  fileId: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
