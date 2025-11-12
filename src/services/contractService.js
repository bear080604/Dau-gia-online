import apiInstance from './api';

/**
 * Contract Service - Optimized
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

export const getContracts = async (userId = null) => {
  const key = userId ? `contracts:user:${userId}` : 'contracts:all';
  const cached = getCached(key);
  if (cached) return cached;

  const data = await dedupe(key, async () => {
    const url = userId ? `contracts?user_id=${userId}` : 'contracts';
    const res = await apiInstance.get(url);
    return res.data;
  });

  setCache(key, data);
  return data;
};

export const getContractById = async (contractId) => {
  const key = `contract:${contractId}`;
  const cached = getCached(key);
  if (cached) return cached;

  const data = await dedupe(key, async () => {
    const res = await apiInstance.get(`contracts/${contractId}`);
    return res.data;
  });

  setCache(key, data);
  return data;
};

// ============================================
// MUTATIONS - Clear cache
// ============================================

export const updateContract = async (contractId, formData) => {
  const res = await apiInstance.post(`contracts/${contractId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  clearCache('contracts:');
  clearCache(`contract:${contractId}`);
  return res.data;
};

export const deleteContract = async (contractId) => {
  // Xóa econtracts trước
  await apiInstance.delete(`econtracts/${contractId}`);
  // Xóa hợp đồng chính
  const res = await apiInstance.delete(`contracts/${contractId}`);
  clearCache('contracts:');
  clearCache(`contract:${contractId}`);
  return res.data;
};