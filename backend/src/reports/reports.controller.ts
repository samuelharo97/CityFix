import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  UnsupportedMediaTypeException,
  PayloadTooLargeException
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import {
  CreateReportDto,
  UpdateReportDto,
  UpdateReportStatusDto,
  ReportResponseDto
} from './dto/report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { User } from '../users/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { StorageService } from '../storage/storage.service';
import { ConfigService } from '@nestjs/config';
import { memoryStorage } from 'multer';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new report' })
  @ApiResponse({
    status: 201,
    description: 'Report created successfully',
    type: ReportResponseDto
  })
  async create(
    @Body() createReportDto: CreateReportDto,
    @Req() req: { user: User }
  ): Promise<ReportResponseDto> {
    return this.reportsService.create(createReportDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reports' })
  @ApiResponse({
    status: 200,
    description: 'Return all reports',
    type: [ReportResponseDto]
  })
  async findAll(): Promise<ReportResponseDto[]> {
    return this.reportsService.findAll();
  }

  @Get('my-reports')
  @ApiOperation({ summary: "Get user's reports" })
  @ApiResponse({
    status: 200,
    description: "Return user's reports",
    type: [ReportResponseDto]
  })
  async findMyReports(
    @Req() req: { user: User }
  ): Promise<ReportResponseDto[]> {
    return this.reportsService.findByUser(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by id' })
  @ApiResponse({
    status: 200,
    description: 'Return report by id',
    type: ReportResponseDto
  })
  async findOne(@Param('id') id: string): Promise<ReportResponseDto> {
    return this.reportsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update report' })
  @ApiResponse({
    status: 200,
    description: 'Report updated successfully',
    type: ReportResponseDto
  })
  async update(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
    @Req() req: { user: User }
  ): Promise<ReportResponseDto> {
    return this.reportsService.update(id, updateReportDto, req.user);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update report status' })
  @ApiResponse({
    status: 200,
    description: 'Report status updated successfully',
    type: ReportResponseDto
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateReportStatusDto,
    @Req() req: { user: { userId: string; email: string; role: string } }
  ): Promise<ReportResponseDto> {
    return this.reportsService.updateStatus(id, updateStatusDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete report' })
  @ApiResponse({ status: 200, description: 'Report deleted successfully' })
  async remove(
    @Param('id') id: string,
    @Req() req: { user: User }
  ): Promise<void> {
    return this.reportsService.remove(id, req.user);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 100 * 1024 * 1024 // 100MB
      },
      fileFilter: (req, file, callback) => {
        // This is handled below in the controller
        callback(null, true);
      }
    })
  )
  @ApiOperation({ summary: 'Upload report media file' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const maxFileSize = parseInt(
      this.configService.get('MAX_FILE_SIZE', '5242880'),
      100
    );

    if (file.size > maxFileSize) {
      throw new PayloadTooLargeException(
        `File too large. Max size: ${maxFileSize / 1024 / 1024}MB`
      );
    }

    if (!this.storageService.isFileTypeAllowed(file.mimetype)) {
      throw new UnsupportedMediaTypeException(
        'Only image and video files are allowed!'
      );
    }

    // Ensure file has a proper filename and originalname
    if (!file.originalname) {
      file.originalname = file.fieldname || 'file';
      // Add extension based on mimetype
      if (file.mimetype.startsWith('image/')) {
        file.originalname += '.jpg';
      } else if (file.mimetype.startsWith('video/')) {
        file.originalname += '.mp4';
      }
    }

    const fileUrl = await this.storageService.saveFile(file);
    return { fileUrl };
  }
}
