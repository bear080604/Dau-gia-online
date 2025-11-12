import apiInstance from './api';

/**
 * Asset/Auction Items Service - Optimized
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

export const getAssets = async () => {
  const key = 'assets';
  const cached = getCached(key);
  if (cached) return cached;

  const data = await dedupe(key, async () => {
    const res = await apiInstance.get('products');
    return res.data;
  });

  setCache(key, data);
  return data;
};

export const getAssetById = async (assetId) => {
  const key = `asset:${assetId}`;
  const cached = getCached(key);
  if (cached) return cached;

  const data = await dedupe(key, async () => {
    const res = await apiInstance.get(`auction-items/${assetId}`);
    return res.data;
  });

  setCache(key, data);
  return data;
};

// Internal function - không export
const getCategoriesForAssets = async () => {
  const key = 'categories';
  const cached = getCached(key, 300000); // 5 phút
  if (cached) return cached;

  const data = await dedupe(key, async () => {
    const res = await apiInstance.get('categories');
    return res.data;
  });

  setCache(key, data);
  return data;
};

// ============================================
// MUTATIONS - Clear cache
// ============================================

export const createAsset = async (formData) => {
  const res = await apiInstance.post('auction-items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  clearCache('assets');
  return res.data;
};

export const updateAsset = async (assetId, formData) => {
  const res = await apiInstance.post(`auction-items/${assetId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  clearCache('assets');
  clearCache(`asset:${assetId}`);
  return res.data;
};

export const approveAsset = async (assetId, data) => {
  const res = await apiInstance.put(`auction-items/${assetId}`, data);
  clearCache('assets');
  clearCache(`asset:${assetId}`);
  return res.data;
};

export const rejectAsset = async (assetId, data) => {
  const res = await apiInstance.put(`auction-items/${assetId}`, data);
  clearCache('assets');
  clearCache(`asset:${assetId}`);
  return res.data;
};

export const deleteAsset = async (assetId) => {
  const res = await apiInstance.delete(`auction-items/${assetId}`);
  clearCache('assets');
  clearCache(`asset:${assetId}`);
  return res.data;
};

export const deleteExtraImage = async (imageId) => {
  const res = await apiInstance.delete(`auction-items/images/${imageId}`);
  // Clear all assets cache vì không biết image thuộc asset nào
  clearCache('assets');
  clearCache('asset:');
  return res.data;
};