export enum ReportCategory {
  INFRASTRUCTURE = 'infrastructure',
  ENVIRONMENT = 'environment',
  SAFETY = 'safety',
  OTHER = 'other'
}

export enum ReportStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  REJECTED = 'rejected'
}

export interface Location {
  x: number;
  y: number;
}

export interface CreateReportDto {
  title: string;
  description: string;
  category: ReportCategory;
  location: { x: number; y: number };
  imageUrl?: string;
  mediaUrls?: string[];
}

export interface UpdateReportDto {
  title?: string;
  description?: string;
  category?: ReportCategory;
  imageUrl?: string;
  location?: Location;
}

export interface UpdateReportStatusDto {
  status: ReportStatus;
  comment?: string;
}

export interface ReportResponseDto {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  imageUrl?: string;
  mediaUrls?: string[];
  location: Location;
  streetName?: string;
  status: ReportStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StatusLogResponseDto {
  id: string;
  reportId: string;
  status: ReportStatus;
  comment?: string;
  changedBy: string;
  createdAt: Date;
}
