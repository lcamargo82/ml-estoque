import { Entity, Column, Unique } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MANAGER = 'manager',
}

@Entity('users')
@Unique(['email'])
export class User extends BaseEntity {
  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'reset_password_token', nullable: true, select: false })
  resetPasswordToken: string;

  @Column({ name: 'reset_password_expires', nullable: true, select: false })
  resetPasswordExpires: Date;
}
