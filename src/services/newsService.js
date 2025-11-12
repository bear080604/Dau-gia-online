import apiInstance from './api';

/**
 * News Service - Optimized
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

export const getNews = async () => {
  const key = 'news';
  const cached = getCached(key);
  if (cached) return cached;

  const data = await dedupe(key, async () => {
    const res = await apiInstance.get('news');
    return res.data;
  });

  setCache(key, data);
  return data;
};

export const getNewsById = async (newsId) => {
  const key = `news:${newsId}`;
  const cached = getCached(key);
  if (cached) return cached;

  const data = await dedupe(key, async () => {
    const res = await apiInstance.get(`news/${newsId}`);
    return res.data;
  });

  setCache(key, data);
  return data;
};

export const getNewsCategories = async () => {
  const key = 'news-categories';
  const cached = getCached(key, 300000); // 5 phút - categories ít thay đổi
  if (cached) return cached;

  const data = await dedupe(key, async () => {
    const res = await apiInstance.get('news-categories');
    return res.data;
  });

  setCache(key, data);
  return data;
};

// Batch loading - load news + categories cùng lúc
export const getNewsPageData = async () => {
  const [news, categories] = await Promise.all([
    getNews(),
    getNewsCategories()
  ]);
  return { news, categories };
};

// ============================================
// MUTATIONS - Clear cache
// ============================================

export const createNews = async (formData) => {
  const res = await apiInstance.post('news', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  clearCache('news');
  return res.data;
};

export const updateNews = async (newsId, formData) => {
  const res = await apiInstance.post(`news/${newsId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  clearCache('news');
  clearCache(`news:${newsId}`);
  return res.data;
};

export const deleteNews = async (newsId) => {
  const res = await apiInstance.delete(`news/${newsId}`);
  clearCache('news');
  clearCache(`news:${newsId}`);
  return res.data;
};