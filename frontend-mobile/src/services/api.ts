import axios, { AxiosError, AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CreateReportDto,
  ReportResponseDto,
  UpdateReportDto,
  UpdateReportStatusDto
} from '../types/report';
import { User } from '../types';

const API_URL = 'http://192.168.0.6:3000'; // Change this to your backend URL

class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async config => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        if (error.response) {
          const errorMessage =
            typeof error.response.data === 'object' &&
            error.response.data !== null &&
            'message' in error.response.data
              ? (error.response.data.message as string)
              : 'An error occurred';

          throw new ApiError(
            error.response.status,
            errorMessage,
            error.response.data
          );
        }
        if (error.request) {
          throw new ApiError(0, 'Network error - no response received');
        }
        throw new ApiError(0, error.message);
      }
    );
  }

  // Auth methods
  async login(
    email: string,
    password: string
  ): Promise<{ access_token: string; user: User }> {
    const response = await this.client.post('/auth/login', { email, password });
    console.log(response.data);
    await AsyncStorage.setItem('token', response.data.access_token);
    return response.data;
  }

  async register(name: string, email: string, password: string) {
    const response = await this.client.post('/auth/register', {
      name,
      email,
      password
    });
    await AsyncStorage.setItem('token', response.data.access_token);
    return response.data;
  }

  async logout() {
    await AsyncStorage.removeItem('token');
  }

  async createReport(data: CreateReportDto) {
    console.log(data);
    const response = await this.client.post<ReportResponseDto>(
      '/reports',
      data
    );
    return response.data;
  }

  async getReports() {
    const response = await this.client.get<ReportResponseDto[]>('/reports');
    return response.data;
  }

  async getMyReports() {
    const response = await this.client.get<ReportResponseDto[]>(
      '/reports/my-reports'
    );
    return response.data;
  }

  async getReport(id: string) {
    const response = await this.client.get<ReportResponseDto>(`/reports/${id}`);
    return response.data;
  }

  async updateReport(id: string, data: UpdateReportDto) {
    const response = await this.client.patch<ReportResponseDto>(
      `/reports/${id}`,
      data
    );
    return response.data;
  }

  async updateReportStatus(id: string, data: UpdateReportStatusDto) {
    const response = await this.client.patch<ReportResponseDto>(
      `/reports/${id}/status`,
      data
    );
    return response.data;
  }

  async deleteReport(id: string) {
    await this.client.delete(`/reports/${id}`);
  }

  async uploadFile(formData: FormData) {
    try {
      console.log('Uploading file to API');

      // For file uploads, we need to use the fetch API directly
      // as axios can sometimes transform the FormData incorrectly
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(`${API_URL}/reports/upload`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
          // Don't set Content-Type header - the browser will set it with the boundary
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', response.status, errorText);
        throw new ApiError(response.status, `Upload failed: ${errorText}`);
      }

      const data = await response.json();
      return data.fileUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
}

export const api = new ApiClient();
export { ApiError };
