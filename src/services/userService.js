import apiInstance from './api';

/**
 * User services - dùng cho cả user và admin
 */

// User (self)
export const getCurrentUser = async () => {
  const response = await apiInstance.get('user');
  return response.data;
};

export const updateUser = async (userId, formData) => {
  const response = await apiInstance.put(`user/update/${userId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Admin: Roles
export const getRoles = async () => {
  const response = await apiInstance.get('roles');
  return response.data;
};

// Admin: Users listing
export const listUsers = async () => {
  const response = await apiInstance.get('showuser');
  return response.data;
};

// Admin: Create user (register)
export const registerUser = async (formData) => {
  const response = await apiInstance.post('register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Admin: Update user
export const updateUserAdmin = async (userId, formData) => {
  // Laravel may require POST + _method=PUT; caller can set it
  const response = await apiInstance.post(`user/update/${userId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Admin: Delete user
export const deleteUser = async (userId) => {
  const response = await apiInstance.delete(`users/${userId}`);
  return response.data;
};

// Admin: Approve/Reject
export const approveUser = async (userId) => {
  const response = await apiInstance.put(`user/approve/${userId}`, {});
  return response.data;
};

export const rejectUser = async (userId) => {
  const response = await apiInstance.put(`user/reject/${userId}`, {});
  return response.data;
};

// Admin: Lock/Unlock
export const lockUser = async (userId) => {
  const response = await apiInstance.post(`user/lock/${userId}`, {});
  return response.data;
};

export const unlockUser = async (userId) => {
  const response = await apiInstance.post(`user/unlock/${userId}`, {});
  return response.data;
};

// Admin: Export
export const exportUsersExcel = async () => {
  const response = await apiInstance.get('users/export-excel', { responseType: 'blob' });
  return response.data;
};

export const exportUserPDF = async (userId) => {
  const response = await apiInstance.get(`users/export-pdf/${userId}`, { responseType: 'blob' });
  return response.data;
};

export const exportUserExcel = async (userId) => {
  const response = await apiInstance.get(`users/export-excel/${userId}`, { responseType: 'blob' });
  return response.data;
};

// Admin: Get user by id
export const getUserById = async (userId) => {
  const response = await apiInstance.get(`user/${userId}`);
  return response.data;
};

