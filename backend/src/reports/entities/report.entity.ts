import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { StatusLog } from './status-log.entity';

export enum ReportStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  REJECTED = 'rejected'
}

export enum ReportCategory {
  INFRASTRUCTURE = 'infrastructure',
  ENVIRONMENT = 'environment',
  SAFETY = 'safety',
  OTHER = 'other'
}

@Entity()
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: ReportCategory,
    default: ReportCategory.OTHER
  })
  category: ReportCategory;

  @Column({ nullable: true })
  imageUrl: string;

  @Column('point', {
    transformer: {
      to(value: { x: number; y: number }): string {
        return `(${value.x},${value.y})`;
      },
      from(value: any): { x: number; y: number } {
        if (typeof value === 'string') {
          const [x, y] = value.replace(/[()]/g, '').split(',').map(Number);
          return { x, y };
        }
        return value; // If it's already an object, return as is
      }
    }
  })
  location: { x: number; y: number };

  @Column({ nullable: true })
  streetName: string;

  @Column('enum', { enum: ReportStatus, default: ReportStatus.PENDING })
  status: ReportStatus;

  @ManyToOne(() => User, user => user.reports)
  createdBy: User;

  @OneToMany(() => StatusLog, statusLog => statusLog.report)
  statusLogs: StatusLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('simple-array', { nullable: true })
  mediaUrls: string[];
}
