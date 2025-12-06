import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { AutomaticTransferSwitchEntity } from './automatic.transfer.switch.entity';
import { FileEntity } from '../file';

@Entity('automatic_transfer_switch_file_relation')
export class AutomaticTransferSwitchFileRelationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AutomaticTransferSwitchEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'automatic_transfer_switch_id' })
  automaticTransferSwitch: AutomaticTransferSwitchEntity;

  @Column({ type: 'uuid', name: 'automatic_transfer_switch_id' })
  automaticTransferSwitchId: string;

  @ManyToOne(() => FileEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'file_id' })
  file: FileEntity;

  @Column({ type: 'uuid', name: 'file_id' })
  fileId: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
