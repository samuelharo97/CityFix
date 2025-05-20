import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { Report } from '../../reports/entities/report.entity';
import { StatusLog } from '../../reports/entities/status-log.entity';

export enum UserRole {
  CITIZEN = 'citizen',
  ADMIN = 'admin'
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CITIZEN
  })
  role: UserRole;

  @OneToMany(() => Report, report => report.createdBy)
  reports: Report[];

  @OneToMany(() => StatusLog, statusLog => statusLog.changedBy)
  statusLogs: StatusLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
