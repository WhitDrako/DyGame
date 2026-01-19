import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('gpo_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 403 && error.response.data?.error === 'BANNED') {
      // Trigger ban state
      window.dispatchEvent(new CustomEvent('user-banned', {
        detail: {
          reason: error.response.data.reason || 'No reason provided'
        }
      }));
    }

    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('gpo_token');
      localStorage.removeItem('gpo_user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (email: string, username: string, password: string) =>
    api.post('/auth/register', { email, username, password }),

  getMe: () => api.get('/auth/me'),
};

// Items APIs
export const itemsApi = {
  getAll: (params?: {
    category?: string;
    rarity?: string;
    search?: string;
    sort?: string;
  }) => api.get('/items', { params }),

  getOne: (id: string) => api.get(`/items/${id}`),

  getHistory: (id: string, range?: string) =>
    api.get(`/items/${id}/history`, { params: { range } }),

  create: (formData: FormData) =>
    api.post('/items', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, formData: FormData) =>
    api.put(`/items/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id: string) => api.delete(`/items/${id}`),

  addHistory: (id: string, data: { value: number; recorded_at?: string; note?: string }) =>
    api.post(`/items/${id}/history`, data),

  updateHistory: (historyId: string, data: { value?: number; recorded_at?: string; note?: string }) =>
    api.put(`/items/history/${historyId}`, data),

  deleteHistory: (historyId: string) =>
    api.delete(`/items/history/${historyId}`),
};

// Categories APIs
export const categoriesApi = {
  getAll: () => api.get('/categories'),

  getOne: (id: string) => api.get(`/categories/${id}`),

  create: (data: { name: string; description?: string; display_order?: number }) =>
    api.post('/categories', data),

  update: (id: string, data: { name?: string; description?: string; display_order?: number }) =>
    api.put(`/categories/${id}`, data),

  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Users APIs (Admin)
export const usersApi = {
  getAll: () => api.get('/users'),

  getOne: (id: string) => api.get(`/users/${id}`),

  ban: (id: string, reason?: string) =>
    api.post(`/users/${id}/ban`, { reason }),

  unban: (id: string) => api.post(`/users/${id}/unban`),

  toggleAdmin: (id: string) => api.post(`/users/${id}/toggle-admin`),

  delete: (id: string) => api.delete(`/users/${id}`),
};

// Trade APIs
export const tradeApi = {
  compare: (itemsGiven: { id: string; quantity: number }[], itemsReceived: { id: string; quantity: number }[]) =>
    api.post('/trade/compare', { items_given: itemsGiven, items_received: itemsReceived }),

  getHistory: () => api.get('/trade/history'),

  getCooldown: () => api.get('/trade/cooldown'),
};

export default api;
