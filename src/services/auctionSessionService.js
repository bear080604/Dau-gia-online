import apiInstance from './api';

/**
 * Service functions cho Auction Session API - có thể dùng cho cả admin và user
 * Admin: Xem tất cả phiên đấu giá, quản lý
 * User: Xem các phiên đấu giá đang diễn ra, tham gia đấu giá
 */

// Lấy danh sách phiên đấu giá
export const getAuctionSessions = async (filters = {}) => {
  // Có thể truyền filters như status, item_id, etc.
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  const url = params.toString() ? `auction-sessions?${params}` : 'auction-sessions';
  const response = await apiInstance.get(url);
  return response.data;
};

// Lấy chi tiết một phiên đấu giá
export const getAuctionSessionById = async (sessionId) => {
  const response = await apiInstance.get(`auction-sessions/${sessionId}`);
  return response.data;
};

// Tạo phiên đấu giá mới
export const createAuctionSession = async (formData) => {
  const response = await apiInstance.post('auction-sessions', formData);
  return response.data;
};

// Cập nhật phiên đấu giá
export const updateAuctionSession = async (sessionId, formData) => {
  const response = await apiInstance.put(`auction-sessions/${sessionId}`, formData);
  return response.data;
};

// Xóa phiên đấu giá và các hợp đồng liên quan
export const deleteAuctionSession = async (sessionId) => {
  // Xóa e-contracts trước
  await apiInstance.delete(`econtracts/${sessionId}`);
  // Xóa contracts
  await apiInstance.delete(`contracts/${sessionId}`);
  // Xóa phiên đấu giá
  const response = await apiInstance.delete(`auction-sessions/${sessionId}`);
  return response.data;
};

// Lấy danh sách bids của một phiên đấu giá
export const getBidsBySessionId = async (sessionId) => {
  const response = await apiInstance.get(`bids/${sessionId}`);
  return response.data;
};

// Lấy danh sách sản phẩm
export const getProducts = async () => {
  const response = await apiInstance.get('products');
  return response.data;
};

// Cache cho users để tránh duplicate calls
let usersCache = null;
let usersCacheTime = null;
const CACHE_DURATION = 60000; // 1 phút

// Lấy danh sách users với cache (dùng cho auction session - không export để tránh conflict)
const getUsersForAuction = async (useCache = true) => {
  const now = Date.now();
  if (useCache && usersCache && usersCacheTime && (now - usersCacheTime) < CACHE_DURATION) {
    return usersCache;
  }
  const response = await apiInstance.get('showuser');
  usersCache = response.data;
  usersCacheTime = now;
  return usersCache;
};

// Clear cache khi cần
export const clearUsersCache = () => {
  usersCache = null;
  usersCacheTime = null;
};

// Lấy danh sách tổ chức đấu giá và đấu giá viên cùng lúc (tối ưu performance)
export const getAuctionOrganizationsAndAuctioneers = async () => {
  const users = await getUsersForAuction();
  const usersList = users.users || [];
  
  const auctionOrgs = usersList
    .filter((user) => user.role_id === 8 || (user.role && user.role.name === 'AuctionOrganization'))
    .map((user) => ({
      id: user.user_id.toString(),
      name: user.full_name,
    }));
  
  const auctioneers = usersList
    .filter((u) => u.role_id === 5)
    .map((u) => ({ id: u.user_id, name: u.full_name }));
  
  return { auctionOrgs, auctioneers };
};

// Lấy danh sách tổ chức đấu giá (users với role_id = 8 hoặc role.name = 'AuctionOrganization')
export const getAuctionOrganizations = async () => {
  const users = await getUsersForAuction();
  const auctionOrgs = users.users
    .filter((user) => user.role_id === 8 || (user.role && user.role.name === 'AuctionOrganization'))
    .map((user) => ({
      id: user.user_id.toString(),
      name: user.full_name,
    }));
  return auctionOrgs;
};

// Lấy danh sách đấu giá viên (users với role_id = 5)
export const getAuctioneers = async () => {
  const users = await getUsersForAuction();
  const auctioneers = users.users
    .filter((u) => u.role_id === 5)
    .map((u) => ({ id: u.user_id, name: u.full_name }));
  return auctioneers;
};

// Toggle favorite cho session
export const toggleSessionFavorite = async (sessionId) => {
  const response = await apiInstance.post(`sessions/${sessionId}/favorite`, {});
  return response.data;
};

export const confirmWinner = async (sessionId) => {
  try {
    const response = await apiInstance.patch(
      `auction-sessions/${sessionId}/confirm-winner`,
      {} // Empty body cho PATCH
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const rejectWinner = async (sessionId, reason) => {
  if (!reason?.trim()) {
    throw new Error('Lý do từ chối là bắt buộc');
  }

  try {
    const response = await apiInstance.patch(
      `auction-sessions/${sessionId}/reject-winner`,
      { reason: reason.trim() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};