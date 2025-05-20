import { useState, useCallback } from 'react';
import { api } from '../services/api';
import { ApiError } from '../services/api';
import {
  ReportResponseDto,
  CreateReportDto,
  UpdateReportDto,
  UpdateReportStatusDto
} from '../types/report';

interface UseReportsReturn {
  reports: ReportResponseDto[];
  loading: boolean;
  error: string | null;
  createReport: (data: CreateReportDto) => Promise<void>;
  updateReport: (id: string, data: UpdateReportDto) => Promise<void>;
  updateReportStatus: (
    id: string,
    data: UpdateReportStatusDto
  ) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  fetchReports: () => Promise<void>;
  fetchMyReports: () => Promise<void>;
  getReport: (id: string) => Promise<ReportResponseDto>;
}

export const useReports = (): UseReportsReturn => {
  const [reports, setReports] = useState<ReportResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown) => {
    if (err instanceof ApiError) {
      setError(err.message);
    } else {
      setError('An unexpected error occurred');
    }
  };

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getReports();
      setReports(data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getMyReports();
      setReports(data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getReport = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getReport(id);
      return data;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createReport = useCallback(async (data: CreateReportDto) => {
    try {
      setLoading(true);
      setError(null);
      const newReport = await api.createReport(data);
      setReports(prev => [...prev, newReport]);
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateReport = useCallback(
    async (id: string, data: UpdateReportDto) => {
      try {
        setLoading(true);
        setError(null);
        const updatedReport = await api.updateReport(id, data);
        setReports(prev =>
          prev.map(report => (report.id === id ? updatedReport : report))
        );
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateReportStatus = useCallback(
    async (id: string, data: UpdateReportStatusDto) => {
      try {
        setLoading(true);
        setError(null);
        const updatedReport = await api.updateReportStatus(id, data);
        setReports(prev =>
          prev.map(report => (report.id === id ? updatedReport : report))
        );
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteReport = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await api.deleteReport(id);
      setReports(prev => prev.filter(report => report.id !== id));
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    reports,
    loading,
    error,
    createReport,
    updateReport,
    updateReportStatus,
    deleteReport,
    fetchReports,
    fetchMyReports,
    getReport
  };
};
