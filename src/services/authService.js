import apiInstance from './api';

/**
 * Service functions cho Authentication API - có thể dùng cho cả admin và user
 */

// Đăng nhập
export const login = async (credentials) => {
  const response = await apiInstance.post('login', credentials, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

// Đăng xuất
export const logout = async () => {
  const response = await apiInstance.post('logout');
  return response.data;
};

// Đăng ký (có thể có FormData với files)
export const register = async (userData) => {
  const response = await apiInstance.post('register', userData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

