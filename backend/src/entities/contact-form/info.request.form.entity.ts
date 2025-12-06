import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('info_request_forms')
export class InfoRequestForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name', type: 'varchar' })
  fullName: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  telephone: string;

  @Column({ type: 'varchar' })
  country: string;

  @Column({ name: 'model_number', type: 'varchar' })
  modelNumber: string;

  @Column({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
