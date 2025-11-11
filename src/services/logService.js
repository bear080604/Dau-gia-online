
import apiInstance from './api';

/**
 * Lấy danh sách log với filter
 * Trả về object: { data: Array, meta: Object, stats: Object }
 */
export const getLogs = async (params = {}) => {
  const res = await apiInstance.get('log', { params });
  // Nếu backend trả { data, meta, stats } thì return nguyên; nếu trả trực tiếp mảng, chuẩn hóa
  const payload = res.data;
  if (Array.isArray(payload)) {
    return { data: payload, meta: { total: payload.length }, stats: {} };
  }
  return payload;
};

// Xem chi tiết log
export const getLogById = async (id) => {
  const response = await apiInstance.get(`log/${id}`);
  return response.data;
};

// Xóa log
export const deleteLog = async (id) => {
  const response = await apiInstance.delete(`log/${id}`);
  return response.data;
};

/**
 * (Tùy chọn) Export logs -> chỉ dùng nếu backend hỗ trợ /log/export trả file
 */
export const exportLogs = async (filters = {}) => {
  const response = await apiInstance.get('log/export', {
    params: filters,
    responseType: 'blob',
  });
  return response.data;
};

/**
 * (Tùy chọn) Clear old logs -> chỉ dùng nếu backend hỗ trợ endpoint này
 */
export const clearOldLogs = async () => {
  const response = await apiInstance.post('log/clear-old');
  return response.data;
};

export default {
  getLogs,
  getLogById,
  deleteLog,
  exportLogs,
  clearOldLogs,
};