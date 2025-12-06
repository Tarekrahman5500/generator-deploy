import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { DieselGeneratorSetEnitiy } from './diesel.generator.entity';
import { FileEntity } from '../file';

@Entity('diesel_generator_file_relation')
export class DieselGeneratorFileRelationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => DieselGeneratorSetEnitiy, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'diesel_generator_id' })
  dieselGenerator: DieselGeneratorSetEnitiy;

  @Column({ type: 'uuid', name: 'diesel_generator_id' })
  dieselGeneratorId: string;

  @ManyToOne(() => FileEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'file_id' })
  file: FileEntity;

  @Column({ type: 'uuid', name: 'file_id' })
  fileId: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
