import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { TowerLightEntity } from './tower.light.entity';
import { FileEntity } from '../file';

@Entity('tower_light_file_relation')
export class TowerLightFileRelationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TowerLightEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tower_light_id' })
  towerLight: TowerLightEntity;

  @Column({ type: 'uuid', name: 'tower_light_id' })
  towerLightId: string;

  @ManyToOne(() => FileEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'file_id' })
  file: FileEntity;

  @Column({ type: 'uuid', name: 'file_id' })
  fileId: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
