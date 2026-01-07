import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { CategoryEntity } from './category.entity';
import { FileEntity } from '../file';

@Entity('category_file_relation')
export class CategoryFileRelationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CategoryEntity, (category) => category.categoryFiles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @Column({ type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => FileEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'file_id' })
  file: FileEntity;

  @Column({ type: 'uuid' })
  fileId: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
