import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Tạo axios instance với cấu hình mặc định
const apiInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 giây
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - thêm token
apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý lỗi chung
apiInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý lỗi 401 - Unauthorized
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    // Xử lý lỗi 403 - Forbidden
    if (error.response && error.response.status === 403) {
      console.error('Access denied:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export default apiInstance;

