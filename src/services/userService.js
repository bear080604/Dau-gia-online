import apiInstance from './api';

/**
 * Service functions cho User API - có thể dùng cho cả admin và user
 */

// Lấy thông tin user hiện tại
export const getCurrentUser = async () => {
  const response = await apiInstance.get('user');
  return response.data;
};

// Cập nhật thông tin user
export const updateUser = async (userId, formData) => {
  const response = await apiInstance.put(`user/update/${userId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Lấy danh sách users (admin only)
export const getUsers = async () => {
  const response = await apiInstance.get('showuser');
  return response.data;
};

// Lấy thông tin user theo ID (admin only)
export const getUserById = async (userId) => {
  const response = await apiInstance.get(`user/${userId}`);
  return response.data;
};

