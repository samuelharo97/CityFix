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
    console.log('updateStatusDto received:', updateStatusDto);
    console.log('Status value:', updateStatusDto.status);
    console.log('User:', user);

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
}
