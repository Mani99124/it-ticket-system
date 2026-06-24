import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ticketService from '../services/ticketService'
import Sidebar from '../components/common/Sidebar'
import TicketCard from '../components/tickets/TicketCard'
import toast from 'react-hot-toast'
import { PlusCircle, Ticket, CheckCircle2, Clock, AlertCircle, ChevronRight } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ticketService.getMyTickets()
      .then(r => setTickets(r.data.data || []))
      .catch(() => toast.error('Failed to load tickets'))
      .finally(() => setLoading(false))
  }, [])

  const counts = {
    TOTAL:       tickets.length,
    OPEN:        tickets.filter(t => t.status === 'OPEN').length,
    IN_PROGRESS: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    RESOLVED:    tickets.filter(t => t.status === 'RESOLVED').length,
  }

  // Only show the 5 most recent tickets on dashboard
  const recentTickets = tickets.slice(0, 5)

  const stats = [
    { label: 'Total Tickets',  value: counts.TOTAL,       icon: Ticket,       color: 'var(--accent)',  bg: 'var(--accent-subtle)',  path: '/tickets' },
    { label: 'Open',           value: counts.OPEN,        icon: AlertCircle,  color: 'var(--info)',    bg: 'var(--info-subtle)',    path: '/tickets' },
    { label: 'In Progress',    value: counts.IN_PROGRESS, icon: Clock,        color: 'var(--warning)', bg: 'var(--warning-subtle)', path: '/tickets' },
    { label: 'Resolved',       value: counts.RESOLVED,    icon: CheckCircle2, color: 'var(--success)', bg: 'var(--success-subtle)', path: '/tickets' },
  ]

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-container">
          <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <h1 className="page-title">My Dashboard</h1>
              <p className="page-subtitle">Welcome back, <strong>{user?.name}</strong> — here's your ticket overview</p>
            </div>
            <button id="create-ticket-btn" className="btn btn-primary" onClick={() => navigate('/tickets/new')}>
              <PlusCircle size={16} /> New Ticket
            </button>
          </div>

          {/* Stats Section */}
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

          {/* Recent Activity Section */}
          <div className="section-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Recent Tickets</h3>
            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/tickets')}>
              View All <ChevronRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : recentTickets.length === 0 ? (
            <div className="empty-state card">
              <Ticket size={48} />
              <h3>No tickets create yet</h3>
              <p style={{ marginBottom:20 }}>Create your first support ticket to see activity here.</p>
              <button className="btn btn-primary" onClick={() => navigate('/tickets/new')}>
                <PlusCircle size={16} /> Create Ticket
              </button>
            </div>
          ) : (
            <div className="grid-2">
              {recentTickets.map(t => <TicketCard key={t.id} ticket={t} basePath="/tickets" />)}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
