import apiInstance from './api';

/**
 * Service functions cho Auction Session API - Optimized version
 * - Thêm caching cho tất cả API calls
 * - Tránh duplicate calls
 * - Batch loading song song
 */

// ============================================
// CACHE MANAGER - Quản lý cache tập trung
// ============================================
const CACHE_DURATION = 60000; // 1 phút

class CacheManager {
  constructor() {
    this.caches = new Map();
  }

  set(key, data) {
    this.caches.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key, maxAge = CACHE_DURATION) {
    const cached = this.caches.get(key);
    if (!cached) return null;
    
    const age = Date.now() - cached.timestamp;
    if (age > maxAge) {
      this.caches.delete(key);
      return null;
    }
    
    return cached.data;
  }

  clear(key) {
    if (key) {
      this.caches.delete(key);
    } else {
      this.caches.clear();
    }
  }

  clearByPrefix(prefix) {
    for (const key of this.caches.keys()) {
      if (key.startsWith(prefix)) {
        this.caches.delete(key);
      }
    }
  }
}

const cache = new CacheManager();

// ============================================
// REQUEST DEDUPLICATION - Tránh duplicate calls
// ============================================
const pendingRequests = new Map();

async function fetchWithDedup(key, fetchFn) {
  // Nếu đang có request pending cho key này, đợi kết quả
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  // Tạo request mới
  const promise = fetchFn().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}

// ============================================
// CORE API FUNCTIONS với Cache & Deduplication
// ============================================

// Lấy danh sách phiên đấu giá
export const getAuctionSessions = async (filters = {}, useCache = true) => {
  const cacheKey = `auction-sessions:${JSON.stringify(filters)}`;
  
  if (useCache) {
    const cached = cache.get(cacheKey);
    if (cached) return cached;
  }

  const response = await fetchWithDedup(cacheKey, async () => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const url = params.toString() ? `auction-sessions?${params}` : 'auction-sessions';
    return apiInstance.get(url);
  });

  const data = response.data;
  cache.set(cacheKey, data);
  return data;
};

// Lấy chi tiết một phiên đấu giá
export const getAuctionSessionById = async (sessionId, useCache = true) => {
  const cacheKey = `auction-session:${sessionId}`;
  
  if (useCache) {
    const cached = cache.get(cacheKey);
    if (cached) return cached;
  }

  const response = await fetchWithDedup(cacheKey, async () => {
    return apiInstance.get(`auction-sessions/${sessionId}`);
  });

  const data = response.data;
  cache.set(cacheKey, data);
  return data;
};

// Lấy danh sách sản phẩm
export const getProducts = async (useCache = true) => {
  const cacheKey = 'products';
  
  if (useCache) {
    const cached = cache.get(cacheKey);
    if (cached) return cached;
  }

  const response = await fetchWithDedup(cacheKey, async () => {
    return apiInstance.get('products');
  });

  const data = response.data;
  cache.set(cacheKey, data);
  return data;
};

// Lấy danh sách users
const getUsers = async (useCache = true) => {
  const cacheKey = 'users';
  
  if (useCache) {
    const cached = cache.get(cacheKey);
    if (cached) return cached;
  }

  const response = await fetchWithDedup(cacheKey, async () => {
    return apiInstance.get('showuser');
  });

  const data = response.data;
  cache.set(cacheKey, data);
  return data;
};

// ============================================
// BATCH LOADING - Gọi nhiều API cùng lúc
// ============================================

/**
 * Lấy tất cả data cần thiết cho auction session page cùng lúc
 * Tránh waterfall loading, tối ưu performance
 */
export const getAuctionSessionPageData = async (filters = {}) => {
  const [sessions, products, { auctionOrgs, auctioneers }] = await Promise.all([
    getAuctionSessions(filters),
    getProducts(),
    getAuctionOrganizationsAndAuctioneers()
  ]);

  return {
    sessions,
    products,
    auctionOrgs,
    auctioneers
  };
};

/**
 * Lấy data cho session detail page
 */
export const getAuctionSessionDetailData = async (sessionId) => {
  const [session, bids] = await Promise.all([
    getAuctionSessionById(sessionId),
    getBidsBySessionId(sessionId)
  ]);

  return { session, bids };
};

// ============================================
// USER & ORGANIZATION FUNCTIONS
// ============================================

// Lấy danh sách tổ chức đấu giá và đấu giá viên cùng lúc
export const getAuctionOrganizationsAndAuctioneers = async (useCache = true) => {
  const cacheKey = 'auction-orgs-auctioneers';
  
  if (useCache) {
    const cached = cache.get(cacheKey);
    if (cached) return cached;
  }

  const users = await getUsers(useCache);
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
  
  const result = { auctionOrgs, auctioneers };
  cache.set(cacheKey, result);
  return result;
};

// Lấy danh sách tổ chức đấu giá
export const getAuctionOrganizations = async (useCache = true) => {
  const { auctionOrgs } = await getAuctionOrganizationsAndAuctioneers(useCache);
  return auctionOrgs;
};

// Lấy danh sách đấu giá viên
export const getAuctioneers = async (useCache = true) => {
  const { auctioneers } = await getAuctionOrganizationsAndAuctioneers(useCache);
  return auctioneers;
};

// ============================================
// MUTATION FUNCTIONS (Create, Update, Delete)
// ============================================

// Tạo phiên đấu giá mới
export const createAuctionSession = async (formData) => {
  const response = await apiInstance.post('auction-sessions', formData);
  // Clear cache sau khi tạo mới
  cache.clearByPrefix('auction-sessions');
  return response.data;
};

// Cập nhật phiên đấu giá
export const updateAuctionSession = async (sessionId, formData) => {
  const response = await apiInstance.put(`auction-sessions/${sessionId}`, formData);
  // Clear cache sau khi update
  cache.clearByPrefix('auction-sessions');
  cache.clear(`auction-session:${sessionId}`);
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
  // Clear cache sau khi xóa
  cache.clearByPrefix('auction-sessions');
  cache.clear(`auction-session:${sessionId}`);
  return response.data;
};

// Xác nhận người thắng đấu giá
export const confirmAuctionWinner = async (sessionId, data = {}) => {
  const response = await apiInstance.patch(`auction-sessions/${sessionId}/confirm-winner`, data);
  cache.clearByPrefix('auction-sessions');
  cache.clear(`auction-session:${sessionId}`);
  return response.data;
};

// Từ chối người thắng đấu giá
export const rejectAuctionWinner = async (sessionId, data) => {
  if (!data?.reason?.trim()) {
    throw new Error('Lý do từ chối là bắt buộc');
  }
  const response = await apiInstance.patch(`auction-sessions/${sessionId}/reject-winner`, data);
  cache.clearByPrefix('auction-sessions');
  cache.clear(`auction-session:${sessionId}`);
  return response.data;
};

// Confirm winner (alias)
export const confirmWinner = confirmAuctionWinner;

// Reject winner (alias with validation)
export const rejectWinner = async (sessionId, reason) => {
  return rejectAuctionWinner(sessionId, { reason });
};

// ============================================
// BIDS & FAVORITES
// ============================================

// Lấy danh sách bids của một phiên đấu giá
export const getBidsBySessionId = async (sessionId, useCache = true) => {
  const cacheKey = `bids:${sessionId}`;
  
  if (useCache) {
    const cached = cache.get(cacheKey, 10000); // Bids cache ngắn hơn - 10s
    if (cached) return cached;
  }

  const response = await fetchWithDedup(cacheKey, async () => {
    return apiInstance.get(`bids/${sessionId}`);
  });

  const data = response.data;
  cache.set(cacheKey, data);
  return data;
};

// Toggle favorite cho session
export const toggleSessionFavorite = async (sessionId) => {
  const response = await apiInstance.post(`sessions/${sessionId}/favorite`, {});
  cache.clear(`auction-session:${sessionId}`);
  return response.data;
};

export const clearCache = (key) => {
  cache.clear(key);
};

// Clear tất cả cache
export const clearAllCache = () => {
  cache.clear();
};

// Clear users cache (backward compatibility)
export const clearUsersCache = () => {
  cache.clear('users');
  cache.clear('auction-orgs-auctioneers');
};

// Export cache manager để sử dụng ở nơi khác nếu cần
export { cache };