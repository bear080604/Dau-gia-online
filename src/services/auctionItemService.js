import apiInstance from './api';

/**
 * Service functions cho Auction Item API - có thể dùng cho cả admin và user
 */

// Lấy chi tiết auction item
export const getAuctionItemById = async (itemId) => {
  const response = await apiInstance.get(`auction-items/${itemId}`);
  return response.data;
};

// Lấy danh sách images của auction item
export const getAuctionItemImages = async (itemId) => {
  const response = await apiInstance.get(`auction-items/${itemId}/images`);
  return response.data;
};

