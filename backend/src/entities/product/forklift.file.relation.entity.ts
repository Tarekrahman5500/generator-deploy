import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ForkliftEntity } from './forklift.entity';
import { FileEntity } from '../file';

@Entity('forklift_file_relation')
export class ForkliftFileRelationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ForkliftEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'forklift_id' })
  forklift: ForkliftEntity;

  @Column({ type: 'uuid', name: 'forklift_id' })
  forkliftId: string;

  @ManyToOne(() => FileEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'file_id' })
  file: FileEntity;

  @Column({ type: 'uuid', name: 'file_id' })
  fileId: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
