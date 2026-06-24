import axiosInstance from './axiosInstance'

const agentService = {
  getMyTickets:  ()         => axiosInstance.get('/api/agent/tickets'),
  getTicketById: (id)       => axiosInstance.get(`/api/agent/tickets/${id}`),
  updateStatus:  (id, data) => axiosInstance.put(`/api/agent/tickets/${id}/status`, data),
  getProfile:    ()         => axiosInstance.get('/api/agent/profile'),
}

export default agentService
