import axios from 'axios'

let accessToken = '' // In-memory storage for the access token
let refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') || '' : ''

export const setAccessToken = (token) => {
  accessToken = token
}

export const getAccessToken = () => {
  return accessToken
}

export const setRefreshToken = (token) => {
  refreshToken = token
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('refreshToken', token)
    } else {
      localStorage.removeItem('refreshToken')
    }
  }
}

export const getRefreshToken = () => {
  return refreshToken
}

const API_URL = import.meta.env.VITE_API_URL || 'https://it-ticket-system-1-8hqa.onrender.com'

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true // Required for sending/receiving cookies
})

// Attach access token to every request from memory
axiosInstance.interceptors.request.use((config) => {
  if (config.url === '/api/auth/refresh' || config.url === 'api/auth/refresh') {
    if (refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null' && refreshToken.trim() !== '') {
      config.headers.Authorization = `Bearer ${refreshToken}`

      if (!config.data) {
        config.data = { refreshToken }
      } else if (typeof config.data === 'string') {
        try {
          const parsed = JSON.parse(config.data)
          parsed.refreshToken = refreshToken
          config.data = parsed
        } catch {
          config.data = { refreshToken }
        }
      } else if (typeof config.data === 'object') {
        config.data = { ...config.data, refreshToken }
      }
    }
    return config
  }

  if (accessToken && accessToken !== 'undefined' && accessToken !== 'null' && accessToken.trim() !== '') {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

let isRefreshing = false
let failedQueue  = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => error ? prom.reject(error) : prom.resolve(token))
  failedQueue = []
}

// Auto-refresh on 401
axiosInstance.interceptors.response.use(
  res => res,
  async (error) => {
    const original = error.config
    
    // If the error is 401 and we aren't already retrying
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`
          return axiosInstance(original)
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        // Call refresh endpoint - browser will automatically send the refreshToken cookie
        console.log(import.meta.env.VITE_API_URL)
        const res = await axiosInstance.post('/api/auth/refresh')
        const newAccess = res.data.data.accessToken
        const newRefresh = res.data.data.refreshTokenString || res.data.data.refreshToken || ''
        
        setAccessToken(newAccess)
        if (newRefresh) {
          setRefreshToken(newRefresh)
        }
        processQueue(null, newAccess)
        
        original.headers.Authorization = `Bearer ${newAccess}`
        return axiosInstance(original)
      } catch (err) {
        processQueue(err, null)
        // If refresh fails, tokens are probably invalid/expired
        setAccessToken('')
        setRefreshToken('')
        localStorage.removeItem('user') 
        
        // Force redirect to login page if we are not already on an auth page
        if (typeof window !== 'undefined' && 
            window.location.pathname !== '/login' && 
            window.location.pathname !== '/register' && 
            window.location.pathname !== '/register/agent') {
          window.location.href = '/login'
        }
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
