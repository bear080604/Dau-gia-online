import apiInstance from './api';

/**
 * Category Service - Optimized
 * Fix: Cache + Deduplication
 */

// ============================================
// SIMPLE CACHE + DEDUPLICATION
// ============================================
const cache = new Map();
const pending = new Map();

const getCached = (key, maxAge = 300000) => { // 5 phút default cho categories
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

export const getCategories = async () => {
  const key = 'categories';
  const cached = getCached(key);
  if (cached) return cached;

  const data = await dedupe(key, async () => {
    const res = await apiInstance.get('categories');
    return res.data;
  });

  setCache(key, data);
  return data;
};

export const getCategoryById = async (categoryId) => {
  const key = `category:${categoryId}`;
  const cached = getCached(key);
  if (cached) return cached;

  const data = await dedupe(key, async () => {
    const res = await apiInstance.get(`categories/${categoryId}`);
    return res.data;
  });

  setCache(key, data);
  return data;
};  