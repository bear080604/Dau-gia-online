import apiInstance from './api';

/**
 * News Category Service - Optimized
 * Cache + Deduplication
 */

// ============================================
// SIMPLE CACHE + DEDUPLICATION
// ============================================
const cache = new Map();
const pending = new Map();

const getCached = (key, maxAge = 300000) => { // 5 phút - categories ít thay đổi
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

export const getNewsCategories = async () => {
  const key = 'news-categories';
  const cached = getCached(key);
  if (cached) return cached;

  const data = await dedupe(key, async () => {
    const res = await apiInstance.get('news-categories');
    return res.data;
  });

  setCache(key, data);
  return data;
};

export const getNewsCategoryById = async (categoryId) => {
  const key = `news-category:${categoryId}`;
  const cached = getCached(key);
  if (cached) return cached;

  const data = await dedupe(key, async () => {
    const res = await apiInstance.get(`news-categories/${categoryId}`);
    return res.data;
  });

  setCache(key, data);
  return data;
};

// ============================================
// MUTATIONS - Clear cache
// ============================================

export const createNewsCategory = async (formData) => {
  const res = await apiInstance.post('news-categories', formData);
  clearCache('news-categories');
  clearCache('news-category:');
  return res.data;
};

export const updateNewsCategory = async (id, formData) => {
  const res = await apiInstance.put(`news-categories/${id}`, formData);
  clearCache('news-categories');
  clearCache(`news-category:${id}`);     
  return res.data;
};

export const deleteNewsCategory = async (id) => {
  const res = await apiInstance.delete(`news-categories/${id}`);
  clearCache('news-categories');
  clearCache(`news-category:${id}`);
  return res.data;
};  