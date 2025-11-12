import apiInstance from './api';

/**
 * User services - Simple optimized version
 * Fix: Cache + Deduplication
 */

// ============================================
// SIMPLE CACHE + DEDUPLICATION
// ============================================
const cache = new Map();
const pending = new Map();

const getCached = (key, maxAge = 60000) => {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.time > maxAge) {
    cache.delete(key);
    return null;
  }
  return item.data;
};

const setCache = (key, data) => {
  cache.set(key, { data, time: Date.now() });
};

const clearCache = (pattern) => {
  if (!pattern) {
    cache.clear();
  } else if (typeof pattern === 'string') {
    cache.delete(pattern);
  } else {
    for (const key of cache.keys()) {
      if (key.startsWith(pattern)) cache.delete(key);
    }
  }
};

const dedupe = async (key, fn) => {
  if (pending.has(key)) return pending.get(key);
  const promise = fn().finally(() => pending.delete(key));
  pending.set(key, promise);
  return promise;
};

// ============================================
// API FUNCTIONS với Cache
// ============================================

export const getCurrentUser = async () => {
  const key = 'current-user';
  const cached = getCached(key, 30000); // 30s
  if (cached) return cached;

  const data = await dedupe(key, async () => {
    const res = await apiInstance.get('user');
    return res.data;
  });

  setCache(key, data);
  return data;
};

export const getUserById = async (userId) => {
  const key = `user:${userId}`;
  const cached = getCached(key);
  if (cached) return cached;

  const data = await dedupe(key, async () => {
    const res = await apiInstance.get(`user/${userId}`);
    return res.data;
  });

  setCache(key, data);
  return data;
};

export const listUsers = async () => {
  const key = 'users-list';
  const cached = getCached(key, 30000); // 30s
  if (cached) return cached;

  const data = await dedupe(key, async () => {
    const res = await apiInstance.get('showuser');
    return res.data;
  });

  setCache(key, data);
  return data;
};

export const getRoles = async () => {
  const key = 'roles';
  const cached = getCached(key, 300000); // 5 phút
  if (cached) return cached;

  const data = await dedupe(key, async () => {
    const res = await apiInstance.get('roles');
    return res.data;
  });

  setCache(key, data);
  return data;
};

// ============================================
// MUTATIONS - Clear cache
// ============================================

export const updateUser = async (userId, formData) => {
  const res = await apiInstance.put(`user/update/${userId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  clearCache('current-user');
  clearCache(`user:${userId}`);
  clearCache('users-list');
  return res.data;
};

export const updateUserAdmin = async (userId, formData) => {
  const res = await apiInstance.post(`user/update/${userId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  clearCache(`user:${userId}`);
  clearCache('users-list');
  return res.data;
};

export const registerUser = async (formData) => {
  const res = await apiInstance.post('register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  clearCache('users-list');
  return res.data;
};

export const deleteUser = async (userId) => {
  const res = await apiInstance.delete(`users/${userId}`);
  clearCache(`user:${userId}`);
  clearCache('users-list');
  return res.data;
};

export const approveUser = async (userId) => {
  const res = await apiInstance.put(`user/approve/${userId}`, {});
  clearCache(`user:${userId}`);
  clearCache('users-list');
  return res.data;
};

export const rejectUser = async (userId) => {
  const res = await apiInstance.put(`user/reject/${userId}`, {});
  clearCache(`user:${userId}`);
  clearCache('users-list');
  return res.data;
};

export const lockUser = async (userId) => {
  const res = await apiInstance.post(`user/lock/${userId}`, {});
  clearCache(`user:${userId}`);
  clearCache('users-list');
  return res.data;
};

export const unlockUser = async (userId) => {
  const res = await apiInstance.post(`user/unlock/${userId}`, {});
  clearCache(`user:${userId}`);
  clearCache('users-list');
  return res.data;
};

// ============================================
// EXPORTS - No cache
// ============================================

export const exportUsersExcel = async () => {
  const res = await apiInstance.get('users/export-excel', { responseType: 'blob' });
  return res.data;
};

export const exportUserPDF = async (userId) => {
  const res = await apiInstance.get(`users/export-pdf/${userId}`, { responseType: 'blob' });
  return res.data;
};

export const exportUserExcel = async (userId) => {
  const res = await apiInstance.get(`users/export-excel/${userId}`, { responseType: 'blob' });
  return res.data;
};