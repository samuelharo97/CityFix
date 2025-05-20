import {
  Injectable,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { StatusLog } from './entities/status-log.entity';
import {
  CreateReportDto,
  UpdateReportDto,
  UpdateReportStatusDto,
  ReportResponseDto
} from './dto/report.dto';
import { User } from '../users/entities/user.entity';
import { ReportStatus } from './enums/report-status.enum';
import { ConfigService } from '@nestjs/config';
import { Between } from 'typeorm';
import { ReportCategory } from './enums/report-category.enum';

@Injectable()
export class ReportsService {
  private readonly apiUrl: string;
  private readonly storageType: string;

  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
    @InjectRepository(StatusLog)
    private statusLogsRepository: Repository<StatusLog>,
    private configService: ConfigService
  ) {
    this.apiUrl = this.configService.get<string>(
      'API_URL',
      'http://localhost:3000'
    );
    this.storageType = this.configService.get<string>('STORAGE_TYPE', 'local');
  }

  private mapToResponseDto(report: Report): ReportResponseDto {
    let createdByInfo = null;
    if (report.createdBy) {
      createdByInfo = {
        id: report.createdBy.id,
        name: report.createdBy.name,
        email: report.createdBy.email,
        role: report.createdBy.role
      };
    }

    return {
      ...report,
      createdBy: createdByInfo,
      imageUrl: report.imageUrl ? this.formatMediaUrl(report.imageUrl) : null,
      mediaUrls: report.mediaUrls?.map(url => this.formatMediaUrl(url)) || [],
      streetName: report.streetName
    };
  }

  private formatMediaUrl(url: string): string {
    if (url.startsWith('http')) {
      return url;
    }
    if (this.storageType === 's3') {
      return url;
    }
    return `${this.apiUrl}/uploads/${url.split('/').pop()}`;
  }

  async create(
    createReportDto: CreateReportDto,
    user: User
  ): Promise<ReportResponseDto> {
    const report = this.reportsRepository.create({
      ...createReportDto,
      createdBy: user
    });

    const savedReport = await this.reportsRepository.save(report);
    return this.mapToResponseDto(savedReport);
  }

  async findAll(): Promise<ReportResponseDto[]> {
    const reports = await this.reportsRepository.find({
      relations: ['createdBy']
    });
    return reports.map(report => this.mapToResponseDto(report));
  }

  private async findOneEntity(id: string): Promise<Report> {
    const report = await this.reportsRepository.findOne({
      where: { id },
      relations: ['createdBy', 'statusLogs', 'statusLogs.changedBy']
    });
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    return report;
  }

  async findOne(id: string): Promise<ReportResponseDto> {
    const report = await this.findOneEntity(id);
    return this.mapToResponseDto(report);
  }

  async update(
    id: string,
    updateReportDto: UpdateReportDto,
    user: User
  ): Promise<ReportResponseDto> {
    const report = await this.findOneEntity(id);

    if (report.createdBy.id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You can only update your own reports');
    }

    Object.assign(report, updateReportDto);
    const updatedReport = await this.reportsRepository.save(report);
    return this.mapToResponseDto(updatedReport);
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateReportStatusDto,
    user: { userId: string; email: string; role: string }
  ): Promise<ReportResponseDto> {
    const report = await this.findOneEntity(id);

    if (!user) {
      throw new ForbiddenException('User information is missing');
    }

    if (user.role !== 'admin') {
      throw new ForbiddenException(
        'Only administrators can update report status'
      );
    }

    // Create status log
    const statusLog = this.statusLogsRepository.create({
      report: { id: report.id },
      status: updateStatusDto.status as unknown as ReportStatus,
      comment: updateStatusDto.comment,
      changedBy: { id: user.userId }
    });
    await this.statusLogsRepository.save(statusLog);
    console.log('Status log created successfully');

    // Update the report status using direct query instead of entity save
    await this.reportsRepository.update(id, { status: updateStatusDto.status });
    console.log('Report status updated successfully');

    // Fetch the updated report
    const updatedReport = await this.findOneEntity(id);
    return this.mapToResponseDto(updatedReport);
  }

  async remove(id: string, user: User): Promise<void> {
    const report = await this.findOneEntity(id);

    if (report.createdBy.id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You can only delete your own reports');
    }

    await this.reportsRepository.remove(report);
  }

  async findByUser(userId: string): Promise<ReportResponseDto[]> {
    const reports = await this.reportsRepository.find({
      where: { createdBy: { id: userId } },
      relations: ['createdBy']
    });
    return reports.map(report => this.mapToResponseDto(report));
  }

  // Statistics methods
  async getStatsSummary() {
    const totalReports = await this.reportsRepository.count();
    const resolvedReports = await this.reportsRepository.count({
      where: { status: ReportStatus.RESOLVED }
    });
    const pendingReports = await this.reportsRepository.count({
      where: { status: ReportStatus.PENDING }
    });
    const inProgressReports = await this.reportsRepository.count({
      where: { status: ReportStatus.IN_PROGRESS }
    });
    const rejectedReports = await this.reportsRepository.count({
      where: { status: ReportStatus.REJECTED }
    });

    // Calculate response and resolution times
    const timeMetrics = await this.calculateTimeMetrics();

    return {
      totalReports,
      byStatus: {
        pending: pendingReports,
        inProgress: inProgressReports,
        resolved: resolvedReports,
        rejected: rejectedReports
      },
      resolutionRate:
        totalReports > 0 ? (resolvedReports / totalReports) * 100 : 0,
      avgResolutionTimeHours: timeMetrics.avgResolutionTimeHours,
      medianResolutionTimeHours: timeMetrics.medianResolutionTimeHours,
      avgFirstResponseTimeHours: timeMetrics.avgFirstResponseTimeHours,
      medianFirstResponseTimeHours: timeMetrics.medianFirstResponseTimeHours
    };
  }

  /**
   * Calculate various time metrics for reports
   */
  private async calculateTimeMetrics() {
    // Get all resolved reports with their creation date
    const resolvedReports = await this.reportsRepository.find({
      where: { status: ReportStatus.RESOLVED },
      select: ['id', 'createdAt']
    });

    const resolutionTimes: number[] = [];
    const firstResponseTimes: number[] = [];

    // Process each resolved report to calculate times
    for (const report of resolvedReports) {
      // Get all status logs for this report ordered by creation date
      const statusLogs = await this.statusLogsRepository.find({
        where: { report: { id: report.id } },
        order: { createdAt: 'ASC' }
      });

      // Calculate first response time (first status change after creation)
      if (statusLogs.length > 0) {
        const firstLog = statusLogs[0];
        const reportCreationTime = new Date(report.createdAt).getTime();
        const firstResponseTime = new Date(firstLog.createdAt).getTime();
        const firstResponseHours =
          (firstResponseTime - reportCreationTime) / 3600000;
        firstResponseTimes.push(firstResponseHours);
      }

      // Find resolution time (time to reach RESOLVED status)
      const resolutionLog = statusLogs.find(
        log => log.status === ReportStatus.RESOLVED
      );
      if (resolutionLog) {
        const reportCreationTime = new Date(report.createdAt).getTime();
        const resolutionTime = new Date(resolutionLog.createdAt).getTime();
        const resolutionHours = (resolutionTime - reportCreationTime) / 3600000;
        resolutionTimes.push(resolutionHours);
      }
    }

    // Calculate averages and medians
    const avgResolutionTimeHours = this.calculateAverage(resolutionTimes);
    const medianResolutionTimeHours = this.calculateMedian(resolutionTimes);
    const avgFirstResponseTimeHours = this.calculateAverage(firstResponseTimes);
    const medianFirstResponseTimeHours =
      this.calculateMedian(firstResponseTimes);

    return {
      avgResolutionTimeHours,
      medianResolutionTimeHours,
      avgFirstResponseTimeHours,
      medianFirstResponseTimeHours
    };
  }

  /**
   * Calculate the average of an array of numbers
   */
  private calculateAverage(array: number[]): number {
    if (array.length === 0) return 0;
    const sum = array.reduce((acc, val) => acc + val, 0);
    return parseFloat((sum / array.length).toFixed(2));
  }

  /**
   * Calculate the median of an array of numbers
   */
  private calculateMedian(array: number[]): number {
    if (array.length === 0) return 0;

    // Sort the array
    const sorted = [...array].sort((a, b) => a - b);

    const mid = Math.floor(sorted.length / 2);

    // If the array has an odd number of elements, return the middle element
    // If the array has an even number of elements, return the average of the two middle elements
    const median =
      sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];

    return parseFloat(median.toFixed(2));
  }

  async getStatsByCategory() {
    const categories = Object.values(ReportCategory);
    const result = await Promise.all(
      categories.map(async (category: ReportCategory) => {
        const count = await this.reportsRepository.count({
          where: { category }
        });
        return { category, count };
      })
    );

    // Sort by count descending
    return result.sort((a, b) => b.count - a.count);
  }

  async getStatsByStatus() {
    const statuses = Object.values(ReportStatus);
    const result = await Promise.all(
      statuses.map(async status => {
        const count = await this.reportsRepository.count({
          where: { status }
        });
        return { status, count };
      })
    );

    return result;
  }

  async getStatsByDate(period: 'day' | 'week' | 'month') {
    let startDate: Date;
    const endDate = new Date();
    const today = new Date();

    switch (period) {
      case 'day':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7); // Last 7 days
        break;
      case 'week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 28); // Last 4 weeks
        break;
      case 'month':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 6); // Last 6 months
        break;
      default:
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 28); // Default to 4 weeks
    }

    const reports = await this.reportsRepository.find({
      where: {
        createdAt: Between(startDate, endDate)
      },
      select: ['createdAt', 'status']
    });

    if (period === 'day') {
      // Group by day
      const groupedByDay = this.groupReportsByDate(reports, 'day');
      return { period, data: groupedByDay };
    } else if (period === 'week') {
      // Group by week
      const groupedByWeek = this.groupReportsByDate(reports, 'week');
      return { period, data: groupedByWeek };
    } else {
      // Group by month
      const groupedByMonth = this.groupReportsByDate(reports, 'month');
      return { period, data: groupedByMonth };
    }
  }

  private groupReportsByDate(
    reports: any[],
    groupBy: 'day' | 'week' | 'month'
  ) {
    const groups = {};

    reports.forEach(report => {
      const date = new Date(report.createdAt);
      let key: string;

      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (groupBy === 'week') {
        // Get the week start date
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          '0'
        )}`; // YYYY-MM
      }

      if (!groups[key]) {
        groups[key] = {
          date: key,
          total: 0,
          byStatus: {
            pending: 0,
            in_progress: 0,
            resolved: 0,
            rejected: 0
          }
        };
      }

      groups[key].total += 1;
      groups[key].byStatus[report.status] += 1;
    });

    // Convert to array and sort by date
    return Object.values(groups).sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }
}
