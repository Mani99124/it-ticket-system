import axios from 'axios'

let accessToken = '' // In-memory storage for the access token

export const setAccessToken = (token) => {
  accessToken = token
}

export const getAccessToken = () => {
  return accessToken
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true // Required for sending/receiving cookies
})

// Attach access token to every request from memory
axiosInstance.interceptors.request.use((config) => {
  // Skip adding Authorization header for refresh requests to avoid header pollution
  if (config.url === '/api/auth/refresh' || config.url === 'api/auth/refresh') {
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
        const res = await axiosInstance.post('/api/auth/refresh')
        const newAccess = res.data.data.accessToken
        
        setAccessToken(newAccess)
        processQueue(null, newAccess)
        
        original.headers.Authorization = `Bearer ${newAccess}`
        return axiosInstance(original)
      } catch (err) {
        processQueue(err, null)
        // If refresh fails, tokens are probably invalid/expired
        setAccessToken('')
        localStorage.removeItem('user') 
        // We don't force redirect here to allow AuthContext to handle state
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
