import apiInstance from './api';

/**
 * Service functions cho Bid API - có thể dùng cho cả admin và user
 */

// Tạo bid mới
export const createBid = async (bidData) => {
  const response = await apiInstance.post('bids', bidData);
  return response.data;
};

// Lấy danh sách bids theo session
export const getBidsBySession = async (sessionId) => {
  const response = await apiInstance.get(`bids/${sessionId}`);
  return response.data;
};

// Lấy chi tiết bid
export const getBidById = async (bidId) => {
  const response = await apiInstance.get(`bids/${bidId}`);
  return response.data;
};

