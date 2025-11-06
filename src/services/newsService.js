import apiInstance from './api';

/**
 * Service functions cho News API - có thể dùng cho cả admin và user
 */

// Lấy danh sách tin tức
export const getNews = async () => {
  const response = await apiInstance.get('news');
  return response.data;
};

// Lấy chi tiết tin tức
export const getNewsById = async (newsId) => {
  const response = await apiInstance.get(`news/${newsId}`);
  return response.data;
};

