import axiosInstance from './axiosInstance'

const adminService = {
  getUsers:         ()                 => axiosInstance.get('/api/admin/users'),
  getAgents:        ()                 => axiosInstance.get('/api/admin/agents'),
  getPendingAgents: ()                 => axiosInstance.get('/api/admin/agents/pending'),
  approveAgent:     (id)               => axiosInstance.put(`/api/admin/agents/${id}/approve`),
  rejectAgent:      (id)               => axiosInstance.put(`/api/admin/agents/${id}/reject`),
  getAllTickets:     ()                 => axiosInstance.get('/api/admin/tickets'),
  assignTicket:     (ticketId, agentId)=> axiosInstance.put(`/api/admin/tickets/${ticketId}/assign?agentId=${agentId}`),
  updateStatus:     (id, data)         => axiosInstance.put(`/api/admin/tickets/${id}/status`,  data),
  getStats:         ()                 => axiosInstance.get('/api/admin/stats'),
  deactivateUser:   (id)               => axiosInstance.delete(`/api/admin/users/${id}`),
}

export default adminService
