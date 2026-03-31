import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  // True until we've finished reading localStorage — prevents flash-redirect on refresh
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('rkl_token')
    const savedUser = localStorage.getItem('rkl_user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    // Done reading — allow ProtectedRoute to make its decision
    setInitializing(false)
  }, [])

  const login = (userData, jwtToken) => {
    setUser(userData)
    setToken(jwtToken)
    localStorage.setItem('rkl_token', jwtToken)
    localStorage.setItem('rkl_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('rkl_token')
    localStorage.removeItem('rkl_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, initializing }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

