import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { CompressorEntity } from './compressor.entity';
import { FileEntity } from '../file';

@Entity('compressor_file_relation')
export class CompressorFileRelationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CompressorEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'compressor_id' })
  compressor: CompressorEntity;

  @Column({ type: 'uuid', name: 'compressor_id' })
  compressorId: string;

  @ManyToOne(() => FileEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'file_id' })
  file: FileEntity;

  @Column({ type: 'uuid', name: 'file_id' })
  fileId: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
