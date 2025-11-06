import apiInstance from './api';

/**
 * Service functions cho Contract API - có thể dùng cho cả admin và user
 * Admin: Xem tất cả hợp đồng
 * User: Xem hợp đồng của chính họ
 */

// Lấy danh sách hợp đồng
// Admin: Lấy tất cả hợp đồng
// User: Lấy hợp đồng của user hiện tại (nếu API hỗ trợ)
export const getContracts = async (userId = null) => {
  const url = userId ? `contracts?user_id=${userId}` : 'contracts';
  const response = await apiInstance.get(url);
  return response.data;
};

// Lấy chi tiết một hợp đồng
export const getContractById = async (contractId) => {
  const response = await apiInstance.get(`contracts/${contractId}`);
  return response.data;
};

// Cập nhật hợp đồng
export const updateContract = async (contractId, formData) => {
  const response = await apiInstance.post(`contracts/${contractId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Xóa hợp đồng và econtracts liên quan
export const deleteContract = async (contractId) => {
  // Xóa econtracts trước
  await apiInstance.delete(`econtracts/${contractId}`);
  // Xóa hợp đồng chính
  const response = await apiInstance.delete(`contracts/${contractId}`);
  return response.data;
};

