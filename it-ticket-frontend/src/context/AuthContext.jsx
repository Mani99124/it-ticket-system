import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import axiosInstance, { setAccessToken } from '../services/axiosInstance'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const initRef = useRef(false)

  // Initial load: restore user from localStorage and perform silent refresh
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    const initAuth = async () => {
      const minimumPreload = new Promise((resolve) => setTimeout(resolve, 1200))

      try {
        const stored = localStorage.getItem('user')
        if (stored) {
          try {
            const userData = JSON.parse(stored)
            setUser(userData)
            
            // Silent refresh: get a fresh accessToken using the httpOnly cookie
            try {
              const res = await axiosInstance.post('/api/auth/refresh')
              if (res.data.data.accessToken) {
                setAccessToken(res.data.data.accessToken)
              }
            } catch (err) {
              console.warn('Silent refresh failed on mount:', err.message)
              // If we are NOT on the login page and refresh fails, we should logout
              if (window.location.pathname !== '/login' && 
                  window.location.pathname !== '/register' && 
                  window.location.pathname !== '/register/agent') {
                logout()
              } else {
                 // Just clear the local user if refresh fails while on auth pages
                 localStorage.removeItem('user')
                 setUser(null)
              }
            }
          } catch (_) {
            localStorage.removeItem('user')
            setUser(null)
          }
        }
      } finally {
        await minimumPreload
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = useCallback((authData) => {
    const userInfo = {
      userId: authData.userId,
      name: authData.name,
      email: authData.email,
      role: authData.role,
    }
    localStorage.setItem('user', JSON.stringify(userInfo))
    setUser(userInfo)
    setAccessToken(authData.accessToken)
  }, [])

  const logout = useCallback(async () => {
    try {
      await axiosInstance.post('/api/auth/logout')
    } catch (_) {}
    
    setAccessToken('')
    localStorage.removeItem('user')
    setUser(null)
    
    // Only redirect if not already on login
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }, [])

  const updateTokens = useCallback((accessToken) => {
    setAccessToken(accessToken)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateTokens }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

