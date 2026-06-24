import axiosInstance from './axiosInstance'

const authService = {
  registerUser:  (data) => axiosInstance.post('/api/auth/register',      data),
  registerAgent: (data) => axiosInstance.post('/api/auth/register/agent', data),
  login:         (data) => axiosInstance.post('/api/auth/login',          data),
  verifyOtp:     (data) => axiosInstance.post('/api/auth/verify-otp',     data),
  resendOtp:     (data) => axiosInstance.post('/api/auth/resend-otp',     data),
  refresh:       (data) => axiosInstance.post('/api/auth/refresh',        data),
  logout:        ()     => axiosInstance.post('/api/auth/logout'),
}

export default authService
