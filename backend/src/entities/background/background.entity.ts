import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FileEntity } from 'src/entities/file/file.entity';

@Entity('background')
export class BackgroundEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  section: string;

  @Column({
    type: 'varchar',
    length: 150,
  })
  title: string;

  @Column({
    type: 'text',
  })
  description: string;

  // ======================
  // FILE (OPTIONAL)
  // ======================
  @ManyToOne(() => FileEntity, (file) => file.backgrounds, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'file_id' })
  file: FileEntity | null;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_visible',
  })
  isVisible: boolean;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    name: 'updated_at',
  })
  updatedAt: Date;
}
