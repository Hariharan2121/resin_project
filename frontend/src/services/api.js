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
export const getProfile = () => api.get('/api/profile');
export const updateProfile = (data) => api.put('/api/profile', data);
export const deleteAccount = () => api.delete('/api/profile');

/**
 * Favourites Services
 */
export const getFavourites = () => api.get('/api/favourites');
export const addFavourite = (productId) => api.post('/api/favourites', { productId });
export const removeFavourite = (productId) => api.delete(`/api/favourites/${productId}`);

/**
 * Custom Order
 */
export const submitCustomOrder = (orderData) => api.post('/api/order/custom', orderData);

/**
 * Auth Services
 */
export const forgotPassword = (email) => api.post('/api/forgot-password', { email });
export const verifyOtp = (email, otp) => api.post('/api/verify-otp', { email, otp });
export const resetPassword = (email, otp, newPassword) => api.post('/api/reset-password', { email, otp, newPassword });

export default api;
