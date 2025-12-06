import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('contact_forms')
export class ContactForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name', type: 'varchar' })
  fullName: string;

  @Column({ type: 'varchar' })
  company: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  telephone: string;

  @Column({ type: 'varchar' })
  country: string;

  @Column({ type: 'varchar' })
  department: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'created_at', type: 'datetime' })
  createdAt: Date;
}
