import apiInstance from './api';

/**
 * Service functions cho Auction Registration API
 * - Lấy danh sách đăng ký
 * - Duyệt/Từ chối đăng ký
 * - Lấy chi tiết đăng ký
 * - Xóa đăng ký
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
  } else {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
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

/**
 * Lấy danh sách đăng ký đấu giá
 * @param {Object} params - { page, per_page, status, search... }
 */
export const getRegistrations = async (params = {}) => {
  const key = `registrations:${JSON.stringify(params)}`;
  const cached = getCached(key);
  if (cached) return cached;

  const data = await dedupe(key, async () => {
    const response = await apiInstance.get('auction-profiles', { params });
    return response.data;
  });

  setCache(key, data);
  return data;
};

/**
 * Lấy chi tiết một đăng ký
 * @param {number|string} registrationId
 */
export const getRegistrationById = async (registrationId) => {
  const key = `registration:${registrationId}`;
  const cached = getCached(key);
  if (cached) return cached;

  const data = await dedupe(key, async () => {
    const response = await apiInstance.get(`auction-profiles/${registrationId}`);
    return response.data;
  });

  setCache(key, data);
  return data;
};

/**
 * Duyệt đăng ký
 * @param {number|string} registrationId
 * @param {Object} data - { approved_by, approved_at... }
 */
export const approveRegistration = async (registrationId, data = {}) => {
  const response = await apiInstance.post(`auction-profiles/${registrationId}/approve`, data);
  clearCache('registrations');
  clearCache(`registration:${registrationId}`);
  return response.data;
};

/**
 * Từ chối đăng ký
 * @param {number|string} registrationId
 * @param {Object} data - { reason, rejected_by, rejected_at... }
 */
export const rejectRegistration = async (registrationId, data = {}) => {
  const response = await apiInstance.post(`auction-profiles/${registrationId}/reject`, data);
  clearCache('registrations');
  clearCache(`registration:${registrationId}`);
  return response.data;
};

/**
 * Xóa đăng ký
 * @param {number|string} registrationId
 */
export const deleteRegistration = async (registrationId) => {
  const response = await apiInstance.delete(`auction-profiles/${registrationId}`);
  clearCache('registrations');
  clearCache(`registration:${registrationId}`);
  return response.data;
};

/**
 * Lấy chi tiết thanh toán của đăng ký
 * @param {number|string} registrationId
 */
export const getRegistrationPayment = async (registrationId) => {
  const key = `registration-payment:${registrationId}`;
  const cached = getCached(key);
  if (cached) return cached;

  const data = await dedupe(key, async () => {
    const response = await apiInstance.get(`auction-profiles/${registrationId}/payment`);
    return response.data;
  });

  setCache(key, data);
  return data;
};

/**
 * Cập nhật trạng thái thanh toán
 * @param {number|string} registrationId
 * @param {Object} data - { payment_status, payment_method... }
 */
export const updatePaymentStatus = async (registrationId, data = {}) => {
  const response = await apiInstance.put(`auction-profiles/${registrationId}/payment`, data);
  clearCache(`registration-payment:${registrationId}`);
  clearCache('registrations');
  return response.data;
};

export default {
  getRegistrations,
  getRegistrationById,
  approveRegistration,
  rejectRegistration,
  deleteRegistration,
  getRegistrationPayment,
  updatePaymentStatus,
};