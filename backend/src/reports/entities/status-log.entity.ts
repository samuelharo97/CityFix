import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Report } from './report.entity';
import { ReportStatus } from '../enums/report-status.enum';

@Entity()
export class StatusLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Report, report => report.statusLogs)
  report: Report;

  @Column('enum', { enum: ReportStatus, default: ReportStatus.PENDING })
  status: ReportStatus;

  @Column({ nullable: true })
  comment: string;

  @ManyToOne(() => User, user => user.statusLogs)
  changedBy: User;

  @CreateDateColumn()
  createdAt: Date;
}
