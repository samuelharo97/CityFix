import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  IsUUID
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReportCategory, ReportStatus } from '../entities/report.entity';

export class CreateReportDto {
  @ApiProperty({ example: 'Broken Street Light' })
  @IsString()
  title: string;

  @ApiProperty({
    example:
      'The street light at the corner of Main St and 1st Ave is not working.'
  })
  @IsString()
  description: string;

  @ApiProperty({ enum: ReportCategory, example: ReportCategory.INFRASTRUCTURE })
  @IsEnum(ReportCategory)
  category: ReportCategory;

  @ApiProperty({ example: { x: 40.7128, y: -74.006 } })
  @IsObject()
  location: { x: number; y: number };

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsString({ each: true })
  mediaUrls?: string[];

  @ApiProperty({ required: false, example: 'Main St, Downtown, New York, NY' })
  @IsString()
  @IsOptional()
  streetName?: string;
}

export class UpdateReportDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ReportCategory, required: false })
  @IsEnum(ReportCategory)
  @IsOptional()
  category?: ReportCategory;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsString({ each: true })
  mediaUrls?: string[];

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  location?: { x: number; y: number };

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  streetName?: string;
}

export class UpdateReportStatusDto {
  @ApiProperty({ enum: ReportStatus })
  @IsEnum(ReportStatus)
  status: ReportStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  comment?: string;
}

export class UserInfoDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  role: string;
}

export class ReportResponseDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ enum: ReportCategory })
  @IsEnum(ReportCategory)
  category: ReportCategory;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ type: [String] })
  mediaUrls: string[];

  @ApiProperty()
  @IsObject()
  location: { x: number; y: number };

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  streetName?: string;

  @ApiProperty({ enum: ReportStatus })
  @IsEnum(ReportStatus)
  status: ReportStatus;

  @ApiProperty({ required: false, type: UserInfoDto })
  @IsOptional()
  createdBy?: UserInfoDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class StatusLogResponseDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsUUID()
  reportId: string;

  @ApiProperty({ enum: ReportStatus })
  @IsEnum(ReportStatus)
  status: ReportStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty()
  @IsUUID()
  changedBy: string;

  @ApiProperty()
  createdAt: Date;
}
