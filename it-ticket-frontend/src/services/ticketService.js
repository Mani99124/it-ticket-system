import axiosInstance from './axiosInstance'

const ticketService = {
  createTicket:   (data)               => axiosInstance.post('/api/tickets',                    data),
  getMyTickets:   ()                   => axiosInstance.get('/api/tickets'),
  getTicketById:  (id)                 => axiosInstance.get(`/api/tickets/${id}`),
  updateStatus:   (id, data)           => axiosInstance.put(`/api/tickets/${id}/status`,        data),
  closeTicket:    (id)                 => axiosInstance.put(`/api/tickets/${id}/close`),
  reopenTicket:   (id)                 => axiosInstance.put(`/api/tickets/${id}/reopen`),
  addComment:     (id, data)           => axiosInstance.post(`/api/tickets/${id}/comments`,     data),
  getComments:    (id)                 => axiosInstance.get(`/api/tickets/${id}/comments`),
  getHistory:     (id)                 => axiosInstance.get(`/api/tickets/${id}/history`),
}

export default ticketService
