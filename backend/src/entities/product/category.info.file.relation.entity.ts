import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { CategoryInfoEntity } from './category.info.entity';
import { FileEntity } from '../file';

@Entity('category_info_file_relation')
export class CategoryInfoFileRelationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CategoryInfoEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_info_id' })
  categoryInfo: CategoryInfoEntity;

  @Column({ type: 'uuid', name: 'category_info_id' })
  categoryInfoId: string;

  @ManyToOne(() => FileEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'file_id' })
  file: FileEntity;

  @Column({ type: 'uuid', name: 'file_id' })
  fileId: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
