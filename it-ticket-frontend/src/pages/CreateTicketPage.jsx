import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ticketService from '../services/ticketService'
import Sidebar from '../components/common/Sidebar'
import toast from 'react-hot-toast'
import { Send, ArrowLeft, Loader2 } from 'lucide-react'

const CATEGORIES = ['Hardware', 'Software', 'Network', 'Account Access', 'Email', 'Printer', 'Other']

export default function CreateTicketPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', category: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await ticketService.createTicket(form)
      const ticket = res.data.data
      toast.success(`Ticket #${ticket.id} created and assigned!`)
      navigate(`/tickets/${ticket.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ticket')
    } finally {
      setLoading(false)
    }
  }

  const priorityColors = { LOW: 'var(--success)', MEDIUM: 'var(--warning)', HIGH: 'var(--danger)' }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-container" style={{ maxWidth: 720 }}>
          <div className="page-header">
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={14} /> Back
            </button>
            <h1 className="page-title" style={{ marginTop: 12 }}>Create Support Ticket</h1>
            <p className="page-subtitle">Describe your issue and our team will be assigned automatically</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div className="form-group">
                <label className="form-label">Title <span style={{ color:'var(--danger)' }}>*</span></label>
                <input id="ticket-title" type="text" name="title" required maxLength={255}
                  className="form-control" placeholder="Brief summary of your issue"
                  value={form.title} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Description <span style={{ color:'var(--danger)' }}>*</span></label>
                <textarea id="ticket-desc" name="description" required
                  className="form-control" rows={5}
                  placeholder="Describe the issue in detail — what happened, when it started, and what you've tried..."
                  value={form.description} onChange={handleChange} />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select id="ticket-priority" name="priority" className="form-control"
                    value={form.priority} onChange={handleChange}>
                    {['LOW','MEDIUM','HIGH'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:6 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background: priorityColors[form.priority] }} />
                    <span style={{ fontSize:'0.8rem', color: priorityColors[form.priority] }}>
                      {form.priority === 'LOW' ? 'Low urgency — resolved within 48hrs' :
                       form.priority === 'MEDIUM' ? 'Medium urgency — resolved within 24hrs' :
                       'High urgency — resolved within 4hrs'}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select id="ticket-category" name="category" className="form-control"
                    value={form.category} onChange={handleChange}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Preview card */}
              {form.title && (
                <div style={{ padding:'14px 16px', borderRadius:'var(--radius-md)', background:'var(--accent-subtle)', border:'1px solid rgba(124,58,237,0.2)' }}>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:4 }}>Preview</div>
                  <div style={{ fontWeight:600 }}>{form.title}</div>
                  {form.category && <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)', marginTop:4 }}>📁 {form.category}</div>}
                </div>
              )}

              <div style={{ display:'flex', gap:12, justifyContent:'flex-end', paddingTop:8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
                <button id="ticket-submit" type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <Loader2 size={16} style={{ animation:'spin 0.7s linear infinite' }} /> : <Send size={16} />}
                  {loading ? 'Submitting…' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
