import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ticketService from '../services/ticketService'
import Sidebar from '../components/common/Sidebar'
import TicketCard from '../components/tickets/TicketCard'
import toast from 'react-hot-toast'
import { PlusCircle, Ticket, Filter } from 'lucide-react'

export default function MyTicketsPage() {
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
    ticketService.getMyTickets()
      .then(r => setTickets(r.data.data || []))
      .catch(() => toast.error('Failed to load tickets'))
      .finally(() => setLoading(false))
  }

  const counts = {
    ALL:         tickets.length,
    OPEN:        tickets.filter(t => t.status === 'OPEN').length,
    IN_PROGRESS: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    RESOLVED:    tickets.filter(t => t.status === 'RESOLVED').length,
    CLOSED:      tickets.filter(t => t.status === 'CLOSED').length,
  }

  const filtered = filter === 'ALL' ? tickets : tickets.filter(t => t.status === filter)

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-container">
          <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <h1 className="page-title">My Tickets</h1>
              <p className="page-subtitle">Manage all your support requests</p>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/tickets/new')}>
              <PlusCircle size={16} /> New Ticket
            </button>
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
              <h3>{filter === 'ALL' ? 'No tickets found' : `No ${filter.replace('_',' ')} tickets`}</h3>
              <p style={{ marginBottom:20 }}>
                {filter === 'ALL' ? "You haven't created any support tickets yet." : 'Try a different status filter.'}
              </p>
              {filter === 'ALL' && (
                <button className="btn btn-primary" onClick={() => navigate('/tickets/new')}>
                  <PlusCircle size={16} /> Create First Ticket
                </button>
              )}
            </div>
          ) : (
            <div className="grid-2">
              {filtered.map(t => <TicketCard key={t.id} ticket={t} basePath="/tickets" />)}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
