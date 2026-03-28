import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Wraps a route so only authenticated users can access it.
 * Waits for localStorage to be read before deciding — prevents flash-redirect on refresh.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth()

  // Still reading localStorage — render nothing to avoid a flash-redirect
  if (initializing) return null

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

