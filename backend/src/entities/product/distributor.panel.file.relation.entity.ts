import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { DistributorPanelEntity } from './distributor.panel.entity';
import { FileEntity } from '../file';

@Entity('distributor_panel_file_relation')
export class DistributorPanelFileRelationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => DistributorPanelEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'distributor_panel_id' })
  distributorPanel: DistributorPanelEntity;

  @Column({ type: 'uuid', name: 'distributor_panel_id' })
  distributorPanelId: string;

  @ManyToOne(() => FileEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'file_id' })
  file: FileEntity;

  @Column({ type: 'uuid', name: 'file_id' })
  fileId: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
