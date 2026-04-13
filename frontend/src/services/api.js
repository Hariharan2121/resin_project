import axios from 'axios';

// --- Axios configuration ---
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Attach token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rkl_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Fetch all products
 */
export const getProducts = async () => {
  try {
    const response = await api.get('/api/products');
    const rawData = response.data;
    if (rawData && rawData.success === true && Array.isArray(rawData.data)) return rawData.data;
    if (Array.isArray(rawData)) return rawData;
    if (rawData && Array.isArray(rawData.products)) return rawData.products;
    return [];
  } catch (error) {
    console.error('❌ Fetch products error:', error);
    return [];
  }
};

/**
 * Fetch product by ID
 * Handles both { success: true, data: {...} } (local) and raw object (Render/legacy) responses.
 */
export const getProductById = async (id) => {
  try {
    const response = await api.get(`/api/products/${id}`);
    const raw = response.data;
    // Format 1: { success: true, data: {...} }
    if (raw && raw.success === true && raw.data) return raw.data;
    // Format 2: raw product object (Render legacy backend)
    if (raw && raw.id) return raw;
    return null;
  } catch (error) {
    console.error(`Fetch product ${id} error:`, error);
    return null;
  }
};

/**
 * Profile Services
 */
export const getProfile = async () => {
  const token = localStorage.getItem('rkl_token');
  const response = await api.get('/api/profile', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error('Failed to fetch profile');
};

export const updateProfile = async (profileData) => {
  try {
    const token = localStorage.getItem('rkl_token');
    const response = await api.put('/api/profile', profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message || 'Update failed');
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

export const deleteAccount = () => api.delete('/api/profile');

/**
 * Favourites Services
 */
export const getFavourites = () => api.get('/api/favourites');
export const addFavourite = (productId) => api.post('/api/favourites', { productId });
export const removeFavourite = (productId) => api.delete(`/api/favourites/${productId}`);

/**
 * Order Services
 */
export const submitCustomOrder = (orderData) => api.post('/api/order/custom', orderData);
export const getMyOrders = () => api.get('/api/order/mine');
export const getAllOrdersAdmin = () => api.get('/api/order/admin/all');
export const updateOrderStatusAdmin = (id, status) => api.patch(`/api/order/${id}/status`, { status });

/**
 * Auth Services
 */
export const forgotPassword = (email) => api.post('/api/forgot-password', { email });
export const verifyOtp = (email, otp) => api.post('/api/verify-otp', { email, otp });
export const resetPassword = (email, otp, newPassword) => api.post('/api/reset-password', { email, otp, newPassword });

/**
 * Admin Upload Services
 */
export const uploadProductsExcel = async (formData) => {
  const token = localStorage.getItem('rkl_token');
  const response = await api.post('/api/bulk-upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  return response.data;
};

export default api;
