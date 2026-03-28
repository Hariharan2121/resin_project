import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Helper: build axios config with Bearer token
const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('rkl_token') || ''}`,
  },
})

// ─── Auth: Forgot Password Flow ───────────────────────────────────────────────

export const forgotPassword = (email) =>
  axios.post(`${BASE}/api/auth/forgot-password`, { email })

export const verifyOtp = (email, otp) =>
  axios.post(`${BASE}/api/auth/verify-otp`, { email, otp })

export const resetPassword = (email, otp, newPassword) =>
  axios.post(`${BASE}/api/auth/reset-password`, { email, otp, newPassword })

// ─── Favourites ───────────────────────────────────────────────────────────────

export const getFavourites = () =>
  axios.get(`${BASE}/api/favourites`, authHeader())

export const addFavourite = (productId) =>
  axios.post(`${BASE}/api/favourites`, { productId }, authHeader())

export const removeFavourite = (productId) =>
  axios.delete(`${BASE}/api/favourites/${productId}`, authHeader())
