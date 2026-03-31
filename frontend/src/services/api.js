import axios from 'axios';

// --- Step 4: Axios configuration ---
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Attach token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * --- Step 4: Fetch all products ---
 * We return response.data.data because backend wraps in { success: true, data: [...] }
 */
export const getProducts = async () => {
  try {
    const response = await api.get('/api/products');
    console.log('API response (getProducts):', response.data);
    if (response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Fetch products error:', error);
    return [];
  }
};

/**
 * Fetch product by ID
 */
export const getProductById = async (id) => {
  try {
    const response = await api.get(`/api/products/${id}`);
    if (response.data.success) {
      return response.data.data;
    }
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

/**
 * Favourites Services
 */
export const getFavourites = () => api.get('/api/favourites');
export const addFavourite = (productId) => api.post('/api/favourites', { productId });
export const removeFavourite = (productId) => api.delete(`/api/favourites/${productId}`);

/**
 * Auth Services (Legacy Support)
 */
export const forgotPassword = (email) => api.post('/api/forgot-password', { email });
export const verifyOtp = (email, otp) => api.post('/api/verify-otp', { email, otp });
export const resetPassword = (email, otp, newPassword) => api.post('/api/reset-password', { email, otp, newPassword });

export default api;
