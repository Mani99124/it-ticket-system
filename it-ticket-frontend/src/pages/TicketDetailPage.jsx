import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ticketService from '../services/ticketService'
import agentService from '../services/agentService'
import Sidebar from '../components/common/Sidebar'
import StatusBadge from '../components/common/StatusBadge'
import toast from 'react-hot-toast'
import { AlertCircle } from 'lucide-react';
import { ArrowLeft, Clock, User, Tag, MessageSquare, History, Check, XCircle } from 'lucide-react'

export default function TicketDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [ticket, setTicket] = useState(null)
  const [comments, setComments] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  
  const service = user?.role === 'AGENT' ? agentService : ticketService
  const isAgent = user?.role === 'AGENT'
  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    Promise.all([
      service.getTicketById(id),
      ticketService.getComments(id),
      ticketService.getHistory(id)
    ])
    .then(([tRes, cRes, hRes]) => {
      setTicket(tRes.data.data)
      setComments(cRes.data.data)
      setHistory(hRes.data.data)
    })
    .catch(err => {
      toast.error('Failed to load ticket details')
      navigate(-1)
    })
    .finally(() => setLoading(false))
  }, [id, service, navigate])

  const handleStatusUpdate = async (newStatus) => {
    try {
      const res = await service.updateStatus(id, { status: newStatus, remarks: 'Status updated via dashboard' })
      setTicket(res.data.data)
      // refresh history
      const hRes = await ticketService.getHistory(id)
      setHistory(hRes.data.data)
      toast.success(`Ticket marked as ${newStatus}`)
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const handleUserAction = async (action) => {
    try {
      const apiCall = action === 'CLOSE' ? ticketService.closeTicket(id) : ticketService.reopenTicket(id)
      const res = await apiCall
      setTicket(res.data.data)
      const hRes = await ticketService.getHistory(id)
      setHistory(hRes.data.data)
      toast.success(`Ticket ${action.toLowerCase()}d successfully`)
    } catch (err) {
      toast.error(`Failed to ${action.toLowerCase()} ticket`)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setSubmittingComment(true)
    try {
      const res = await ticketService.addComment(id, { content: newComment })
      setComments([...comments, res.data.data])
      setNewComment('')
      toast.success('Comment added')
    } catch (err) {
      toast.error('Failed to add comment')
    } finally {
      setSubmittingComment(false)
    }
  }

  if (loading) return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content flex-center">
        <div className="spinner-wrap"><div className="spinner" /></div>
      </main>
    </div>
  )

  if (!ticket) return null

  const canComment = ticket.status !== 'CLOSED'
  const isAgentAssigned = isAgent && ticket.assignedTo?.id === user.id

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-container">
          <button className="btn btn-secondary btn-sm mb-4" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
            <ArrowLeft size={14} /> Back
          </button>
          
          <div className="grid-3">
            {/* Main Content (Left, 2 columns) */}
            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Ticket Details */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Ticket #{ticket.id}</div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{ticket.title}</h1>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <StatusBadge value={ticket.priority} />
                    <StatusBadge value={ticket.status} />
                  </div>
                </div>
                
                <div style={{ padding: '16px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
                  <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{ticket.description}</p>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><User size={14}/> Created by {ticket.createdBy.name}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Tag size={14}/> {ticket.category || 'No Category'}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14}/> Created {new Date(ticket.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="card card-sm" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {(isAgent || isAdmin) && ticket.status !== 'CLOSED' && (
                  <>
                    <button className="btn btn-secondary" onClick={() => handleStatusUpdate('IN_PROGRESS')} disabled={ticket.status === 'IN_PROGRESS'}>
                      Mark In Progress
                    </button>
                    <button className="btn btn-success" onClick={() => handleStatusUpdate('RESOLVED')} disabled={ticket.status === 'RESOLVED'}>
                      <Check size={16}/> Resolve
                    </button>
                  </>
                )}
                
                {!isAgent && ticket.status === 'RESOLVED' && (
                  <>
                    <button className="btn btn-primary" onClick={() => handleUserAction('CLOSE')}>
                      <Check size={16}/> Accept & Close
                    </button>
                    <button className="btn btn-danger" onClick={() => handleUserAction('REOPEN')}>
                      <XCircle size={16}/> Reopen Ticket
                    </button>
                  </>
                )}
              </div>

              {/* Comments Section */}
              <div className="card">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: '1.1rem' }}>
                  <MessageSquare size={18} /> Discussion
                </h3>
                
                <div className="comment-list" style={{ marginBottom: 20 }}>
                  {comments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No comments yet.</div>
                  ) : (
                    comments.map(c => (
                      <div key={c.id} className="comment-item">
                        <div className="comment-header">
                          <span className="comment-author">
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                              {c.author.name.charAt(0).toUpperCase()}
                            </div>
                            {c.author.name}
                            {c.author.id === ticket.createdBy.id && <StatusBadge value="AUTHOR" type="badge-low" />}
                            {c.author.role === 'AGENT' && <StatusBadge value="AGENT" type="badge-info" />}
                          </span>
                          <span className="comment-time">{new Date(c.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="comment-body">{c.content}</div>
                      </div>
                    ))
                  )}
                </div>

                {canComment ? (
                  <form onSubmit={handleAddComment}>
                    <textarea 
                      className="form-control" 
                      placeholder="Add a comment..." 
                      rows={3} 
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      required
                      style={{ marginBottom: 12 }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button type="submit" className="btn btn-primary" disabled={submittingComment || !newComment.trim()}>
                        Post Comment
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ padding: '12px', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    This ticket is closed. Discussion locked.
                  </div>
                )}
              </div>
            </div>

            {/* Side Content (Right, 1 column) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Assignee Card */}
              <div className="card card-sm">
                <h4 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Assigned Agent</h4>
                {ticket.assignedTo ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={20} color="var(--accent)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{ticket.assignedTo.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{ticket.assignedTo.email}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: 'var(--warning)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertCircle size={14}/> Unassigned
                  </div>
                )}
              </div>

              {/* History Timeline */}
              <div className="card card-sm">
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
                  <History size={14} /> Activity History
                </h4>
                <div className="timeline">
                  {history.length === 0 ? (
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No history recorded.</div>
                  ) : (
                    history.map(h => (
                      <div key={h.id} className="timeline-item">
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                          <div className="timeline-title">
                            {h.newStatus === 'OPEN' ? 'Ticket Created' : `Status changed to ${h.newStatus}`}
                          </div>
                          <div className="timeline-time">{new Date(h.changedAt).toLocaleString()} by {h.changedBy.name}</div>
                          {h.remarks && <div className="timeline-desc">{h.remarks}</div>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  )
}
