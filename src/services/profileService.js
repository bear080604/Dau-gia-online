import apiInstance from './api';

/**
 * Service functions cho Auction Profile API - có thể dùng cho cả admin và user
 * Profile = Hồ sơ đăng ký tham gia đấu giá
 */

// Tạo hồ sơ đăng ký tham gia đấu giá
export const createProfile = async (formData) => {
  const response = await apiInstance.post('auction-profiles', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Lấy chi tiết hồ sơ
export const getProfileById = async (profileId) => {
  const response = await apiInstance.get(`auction-profiles/${profileId}`);
  return response.data;
};

// Hoàn tất thủ tục hồ sơ
export const completeProfile = async (profileId) => {
  const response = await apiInstance.post(`auction-profiles/${profileId}/complete`);
  return response.data;
};

// Lấy danh sách hồ sơ theo session
export const getProfilesBySession = async (sessionId) => {
  const response = await apiInstance.get(`auction-profiles?session_id=${sessionId}`);
  return response.data;
};

