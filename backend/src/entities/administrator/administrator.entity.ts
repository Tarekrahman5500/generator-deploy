import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AdministratorToken } from './administrator.token.entity';
import { AdministratorRole } from '../../common/enums';

@Entity('administrators')
export class Administrator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  phone: string;

  @Column({ type: 'varchar' })
  userName: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'enum', enum: AdministratorRole })
  role: AdministratorRole;

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

  @OneToMany(() => AdministratorToken, (token) => token.user)
  tokens: AdministratorToken[];
}
