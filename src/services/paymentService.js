import apiInstance from './api';

/**
 * Service functions cho Payment API - có thể dùng cho cả admin và user
 */

// Thanh toán đặt cọc (deposit)
export const payDeposit = async (paymentData) => {
  const response = await apiInstance.post('deposit/pay', paymentData);
  return response.data;
};

// Lấy thông tin thanh toán
export const getPayment = async (paymentId) => {
  const response = await apiInstance.get(`payments/${paymentId}`);
  return response.data;
};

// Lấy lịch sử thanh toán
export const getPaymentHistory = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  const url = params.toString() ? `payments?${params}` : 'payments';
  const response = await apiInstance.get(url);
  return response.data;
};

