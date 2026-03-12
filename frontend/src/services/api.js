import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Users
export const getUsers = () => api.get('/users');
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Cars
export const getCars = (params) => api.get('/cars', { params });
export const getCar = (id) => api.get(`/cars/${id}`);
export const createCar = (data) => api.post('/cars', data);
export const updateCar = (id, data) => api.put(`/cars/${id}`, data);
export const deleteCar = (id) => api.delete(`/cars/${id}`);

// Leads
export const getLeads = (params) => api.get('/leads', { params });
export const getLead = (id) => api.get(`/leads/${id}`);
export const createLead = (data) => api.post('/leads', data);
export const updateLead = (id, data) => api.put(`/leads/${id}`, data);
export const deleteLead = (id) => api.delete(`/leads/${id}`);
export const getLeadTimeline = (id) => api.get(`/leads/${id}/timeline`);

// Test Drives
export const getTestDrives = (params) => api.get('/testdrives', { params });
export const createTestDrive = (data) => api.post('/testdrives', data);
export const updateTestDrive = (id, data) => api.put(`/testdrives/${id}`, data);

// Deals
export const getDeals = (params) => api.get('/deals', { params });
export const getDeal = (id) => api.get(`/deals/${id}`);
export const createDeal = (data) => api.post('/deals', data);
export const updateDeal = (id, data) => api.put(`/deals/${id}`, data);

// Follow-ups
export const getFollowups = (params) => api.get('/followups', { params });
export const createFollowup = (data) => api.post('/followups', data);
export const updateFollowup = (id, data) => api.put(`/followups/${id}`, data);

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getDashboardCharts = () => api.get('/dashboard/charts');

export default api;
