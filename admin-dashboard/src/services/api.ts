import axios from 'axios';

const API_URL = 'http://localhost:3000'; // Change to your backend URL

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

// Reports API
export const reportsApi = {
  // Get all reports
  getReports: async () => {
    const response = await api.get('/reports');
    return response.data;
  },

  // Get a single report by ID
  getReport: async (id: string) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  // Update report status
  updateReportStatus: async (id: string, status: string, comment?: string) => {
    console.log('API call - updateReportStatus:', { id, status, comment });
    const requestBody = { status, comment };
    console.log('Request body:', requestBody);
    const response = await api.patch(`/reports/${id}/status`, requestBody);
    return response.data;
  },

  // Delete a report
  deleteReport: async (id: string) => {
    await api.delete(`/reports/${id}`);
  }
};

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  }
};

// Users API
export const usersApi = {
  getUser: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }
};
