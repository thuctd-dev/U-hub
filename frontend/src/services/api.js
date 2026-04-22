import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('u-hub-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: Handle 401 responses (expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('u-hub-token');
      localStorage.removeItem('u-hub-user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ Auth API ============
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// ============ Task API ============
export const taskAPI = {
  getAll: (projectId) => api.get('/tasks', { params: projectId ? { projectId } : {} }),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  updateStatus: (id, data) => api.patch(`/tasks/${id}/status`, data),
  updatePriority: (id, data) => api.patch(`/tasks/${id}/priority`, data),
  updateDates: (id, data) => api.patch(`/tasks/${id}/dates`, data),
  addSubtask: (id, data) => api.post(`/tasks/${id}/subtasks`, data),
  updateSubtask: (id, subId, data) => api.patch(`/tasks/${id}/subtasks/${subId}`, data),
  deleteSubtask: (id, subId) => api.delete(`/tasks/${id}/subtasks/${subId}`),
};

// ============ User API ============
export const userAPI = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  seed: () => api.post('/users/seed'),
};

export default api;

// ============ AI API ============
export const aiAPI = {
  generateTasks: (data) => api.post('/ai/generate-tasks', data),
};

// ============ Project API ============
export const projectAPI = {
  getAll: () => api.get('/projects'),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  complete: (id) => api.patch(`/projects/${id}/complete`),
  reopen: (id) => api.patch(`/projects/${id}/reopen`),
};
