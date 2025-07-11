// src/utils/api.js
import axios from 'axios';

// ---------------------------------------------------------------------------
// 1. Base URL  →  http://localhost:5000/api
//    (the server mounts auth routes with app.use('/api', authRouter))
// ---------------------------------------------------------------------------
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,          // keeps cookies if you ever return them
});

// ---------------------------------------------------------------------------
// 2. Request interceptor – attach JWT from localStorage
// ---------------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// 3. Response interceptor – global 401 handler
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // redirect to login
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
