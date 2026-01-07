import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Administrator } from './administrator.entity';

@Entity('administrators_tokens')
export class AdministratorToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => Administrator, (user) => user.tokens)
  @JoinColumn({ name: 'user_id' })
  user: Administrator;

  @Column({ type: 'text' })
  token: string;

  @Column({ name: 'expires_at', type: 'datetime' })
  expiresAt: Date;

  @Column({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @Column({ name: 'logout_at', type: 'datetime', nullable: true })
  logoutAt?: Date | null;
}
