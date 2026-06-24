import { useNavigate } from 'react-router-dom'
import StatusBadge from '../common/StatusBadge'
import { Clock, User, Tag } from 'lucide-react'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs  < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function TicketCard({ ticket, basePath = '/tickets' }) {
  const navigate = useNavigate()

  return (
    <div className="ticket-card fade-in" onClick={() => navigate(`${basePath}/${ticket.id}`)}>
      <div className="ticket-card-header">
        <div>
          <div className="ticket-id">#{ticket.id}</div>
          <div className="ticket-title">{ticket.title}</div>
        </div>
        <StatusBadge value={ticket.status} />
      </div>

      <p className="ticket-desc">{ticket.description}</p>

      <div className="ticket-meta">
        <StatusBadge value={ticket.priority} />
        {ticket.category && (
          <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.78rem', color:'var(--text-muted)' }}>
            <Tag size={12} /> {ticket.category}
          </span>
        )}
      </div>

      <div className="ticket-footer">
        <span style={{ display:'flex', alignItems:'center', gap:5 }}>
          <User size={12} />
          {ticket.assignedTo ? `Assigned to ${ticket.assignedTo.name}` : 'Unassigned'}
        </span>
        <span style={{ display:'flex', alignItems:'center', gap:5 }}>
          <Clock size={12} /> {timeAgo(ticket.createdAt)}
        </span>
      </div>
    </div>
  )
}
