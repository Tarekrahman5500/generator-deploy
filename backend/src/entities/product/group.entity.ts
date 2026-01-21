import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  OneToMany,
} from 'typeorm';
import { CategoryEntity } from './category.entity';
import { FieldEntity } from './field.entity';

@Entity('group')
@Unique('uq_group_name_category', ['groupName', 'category'])
export class GroupEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: true })
  serialNo: number;

  @Column({ type: 'varchar', length: 100, name: 'group_name' })
  groupName: string;

  @ManyToOne(() => CategoryEntity, (category) => category.categoryFiles, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @OneToMany(() => FieldEntity, (field) => field.group)
  fields: FieldEntity[];

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
