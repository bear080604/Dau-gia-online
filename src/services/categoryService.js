import apiInstance from './api';

/**
 * Service functions cho Category API - có thể dùng cho cả admin và user
 */

// Lấy danh sách categories
export const getCategories = async () => {
  const response = await apiInstance.get('categories');
  return response.data;
};

// Lấy chi tiết category
export const getCategoryById = async (categoryId) => {
  const response = await apiInstance.get(`categories/${categoryId}`);
  return response.data;
};

