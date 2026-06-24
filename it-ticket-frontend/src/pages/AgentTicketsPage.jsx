import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import agentService from '../services/agentService'
import Sidebar from '../components/common/Sidebar'
import TicketCard from '../components/tickets/TicketCard'
import toast from 'react-hot-toast'
import { Ticket, Filter, Headset } from 'lucide-react'

export default function AgentTicketsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = () => {
    setLoading(true)
    agentService.getMyTickets()
      .then(r => setTickets(r.data.data || []))
      .catch(() => toast.error('Failed to load assigned tickets'))
      .finally(() => setLoading(false))
  }

  const counts = {
    ALL:         tickets.length,
    OPEN:        tickets.filter(t => t.status === 'OPEN' || t.status === 'REOPENED').length,
    IN_PROGRESS: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    RESOLVED:    tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
  }

  const filtered = filter === 'ALL' ? tickets : tickets.filter(t => {
      if (filter === 'OPEN') return t.status === 'OPEN' || t.status === 'REOPENED'
      if (filter === 'RESOLVED') return t.status === 'RESOLVED' || t.status === 'CLOSED'
      return t.status === filter
    })

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">Assigned Tickets</h1>
            <p className="page-subtitle">Queue of all tickets assigned to you</p>
          </div>

          {/* Filter tabs */}
          <div className="card card-sm" style={{ marginBottom: 24, padding: 12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, color:'var(--text-muted)', fontSize:'0.85rem', marginRight:10 }}>
                <Filter size={16} /> Filter:
              </div>
              {Object.entries(counts).map(([key, count]) => (
                <button key={key}
                  className={`btn btn-sm ${filter === key ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilter(key)}>
                  {key.replace('_',' ')} <span style={{ opacity: 0.7, marginLeft: 4 }}>({count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tickets grid */}
          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state card">
              <Ticket size={48} />
              <h3>{filter === 'ALL' ? 'No tickets assigned' : `No ${filter.replace('_',' ')} tickets`}</h3>
              <p>Great job! You have no tickets in this category.</p>
            </div>
          ) : (
            <div className="grid-2">
              {filtered.map(t => <TicketCard key={t.id} ticket={t} basePath="/agent/tickets" />)}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
