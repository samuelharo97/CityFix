import axios from 'axios';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 Unauthorized errors (expired token, etc.)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const reportsApi = {
  getReports: async () => {
    const response = await api.get('/reports');
    return response.data;
  },

  getReport: async (id: string) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  updateReportStatus: async (id: string, status: string, comment?: string) => {
    const requestBody = { status, comment };
    const response = await api.patch(`/reports/${id}/status`, requestBody);
    return response.data;
  },

  deleteReport: async (id: string) => {
    await api.delete(`/reports/${id}`);
  },

  getStatsSummary: async () => {
    const response = await api.get('/reports/stats/summary');
    return response.data;
  },

  getStatsByCategory: async () => {
    const response = await api.get('/reports/stats/by-category');
    return response.data;
  },

  getStatsByStatus: async () => {
    const response = await api.get('/reports/stats/by-status');
    return response.data;
  },

  getStatsByDate: async (period: 'day' | 'week' | 'month' = 'week') => {
    const response = await api.get(`/reports/stats/by-date?period=${period}`);
    return response.data;
  }
};

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  }
};

export const usersApi = {
  getUser: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }
};
