export type ReportStatus = 'pending' | 'in_progress' | 'resolved';

export type ReportCategory =
  | 'infrastructure'
  | 'environment'
  | 'safety'
  | 'other';

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  status: ReportStatus;
  location: Location;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
}
