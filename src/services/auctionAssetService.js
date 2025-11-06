import apiInstance from './api';


export const getAssets = async () => {
  const response = await apiInstance.get('products');
  return response.data;
};

// Lấy chi tiết một tài sản đấu giá
export const getAssetById = async (assetId) => {
  const response = await apiInstance.get(`auction-items/${assetId}`);
  return response.data;
};

// Lấy danh sách categories cho auction assets (không export để tránh conflict với categoryService)
// Nên dùng getCategories từ categoryService thay vì function này
const getCategoriesForAssets = async () => {
  const response = await apiInstance.get('categories');
  return response.data;
};

// Tạo tài sản đấu giá mới
export const createAsset = async (formData) => {
  const response = await apiInstance.post('auction-items', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Cập nhật tài sản đấu giá
export const updateAsset = async (assetId, formData) => {
  // Laravel form method spoofing: sử dụng POST với _method=PUT
  const response = await apiInstance.post(`auction-items/${assetId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Duyệt tài sản (approve)
export const approveAsset = async (assetId, data) => {
  const response = await apiInstance.put(`auction-items/${assetId}`, data);
  return response.data;
};

// Từ chối tài sản (reject)
export const rejectAsset = async (assetId, data) => {
  const response = await apiInstance.put(`auction-items/${assetId}`, data);
  return response.data;
};

// Xóa tài sản đấu giá
export const deleteAsset = async (assetId) => {
  const response = await apiInstance.delete(`auction-items/${assetId}`);
  return response.data;
};

// Xóa ảnh bổ sung
export const deleteExtraImage = async (imageId) => {
  const response = await apiInstance.delete(`auction-items/images/${imageId}`);
  return response.data;
};

