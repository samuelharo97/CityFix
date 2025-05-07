// User related types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Report related types
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

export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  imageUrl?: string;
  mediaUrls?: string[];
  location: Location;
  status: ReportStatus;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface StatusLog {
  id: string;
  reportId: string;
  status: ReportStatus;
  comment?: string;
  changedBy: string;
  createdAt: string;
}

// Form related types
export interface LoginFormData {
  email: string;
  password: string;
}
