import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import agentService from '../services/agentService'
import Sidebar from '../components/common/Sidebar'
import TicketCard from '../components/tickets/TicketCard'
import toast from 'react-hot-toast'
import { Ticket, Clock, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react'

export default function AgentDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    agentService.getMyTickets()
      .then(r => setTickets(r.data.data || []))
      .catch(() => toast.error('Failed to load assigned tickets'))
      .finally(() => setLoading(false))
  }, [])

  const counts = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN' || t.status === 'REOPENED').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
  }

  const attentionTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS' || t.status === 'REOPENED').slice(0, 5)
  const recentResolved = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').slice(0, 5)

  const stats = [
    { label: 'Assigned',    value: counts.total,      icon: Ticket,       color: 'var(--accent)',  bg: 'var(--accent-subtle)',  path: '/agent/tickets' },
    { label: 'Attention',   value: counts.open,       icon: AlertCircle,  color: 'var(--info)',    bg: 'var(--info-subtle)',    path: '/agent/tickets' },
    { label: 'In Progress', value: counts.inProgress, icon: Clock,        color: 'var(--warning)', bg: 'var(--warning-subtle)', path: '/agent/tickets' },
    { label: 'Efficiency',  value: counts.resolved,   icon: CheckCircle2, color: 'var(--success)', bg: 'var(--success-subtle)', path: '/agent/tickets' },
  ]

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">Agent Workspace</h1>
            <p className="page-subtitle">Welcome back, <strong>{user?.name}</strong>. Here's your workload overview.</p>
          </div>

          <div className="grid-4" style={{ marginBottom: 40 }}>
            {stats.map(s => (
              <div key={s.label} className="stat-card clickable" onClick={() => navigate(s.path)}>
                <div className="stat-icon" style={{ background: s.bg }}>
                  <s.icon size={22} color={s.color} />
                </div>
                <div className="stat-info">
                  <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid-2">
            <div>
              <div className="section-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Requires Attention</h3>
                <button className="btn btn-sm btn-secondary" onClick={() => navigate('/agent/tickets')}>
                  View All <ChevronRight size={14} />
                </button>
              </div>
              {loading ? (
                <div className="spinner-wrap"><div className="spinner" /></div>
              ) : attentionTickets.length === 0 ? (
                <div className="empty-state card card-sm">
                  <CheckCircle2 size={40} color="var(--success)" style={{ marginBottom: 12, opacity: 0.8 }}/>
                  <p>All caught up! No active tickets.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {attentionTickets.map(t => <TicketCard key={t.id} ticket={t} basePath="/agent/tickets" />)}
                </div>
              )}
            </div>
            
            <div>
              <div className="section-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Recently Resolved</h3>
              </div>
              {loading ? (
                <div className="spinner-wrap"><div className="spinner" /></div>
              ) : recentResolved.length === 0 ? (
                <div className="empty-state card card-sm">
                  <p style={{ color: 'var(--text-muted)' }}>No resolved tickets yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {recentResolved.map(t => <TicketCard key={t.id} ticket={t} basePath="/agent/tickets" />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
