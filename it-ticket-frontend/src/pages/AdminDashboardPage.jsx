import { useEffect, useState } from 'react'
import adminService from '../services/adminService'
import Sidebar from '../components/common/Sidebar'
import StatusBadge from '../components/common/StatusBadge'
import toast from 'react-hot-toast'
import { Ticket, Users, Headset, CheckCircle, XCircle } from 'lucide-react'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [pendingAgents, setPendingAgents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [sRes, pRes] = await Promise.all([
        adminService.getStats(),
        adminService.getPendingAgents()
      ])
      setStats(sRes.data.data)
      setPendingAgents(pRes.data.data)
    } catch (err) {
      toast.error('Failed to load admin dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleAgentDecision = async (id, action) => {
    try {
      if (action === 'APPROVE') {
        await adminService.approveAgent(id)
        toast.success('Agent approved')
      } else {
        await adminService.rejectAgent(id)
        toast.success('Agent rejected')
      }
      fetchData() // refresh list
    } catch (err) {
      toast.error(`Failed to ${action.toLowerCase()} agent`)
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">System overview and approvals</p>
          </div>

          {loading || !stats ? (
             <div className="spinner-wrap"><div className="spinner" /></div>
          ) : (
            <>
              <div className="grid-4" style={{ marginBottom: 32 }}>
                <div className="stat-card clickable" onClick={() => navigate('/admin/tickets')}>
                  <div className="stat-icon" style={{ background: 'var(--accent-subtle)' }}><Ticket color="var(--accent)" /></div>
                  <div className="stat-info">
                    <div className="stat-value" style={{ color: 'var(--accent)' }}>{stats.totalTickets}</div>
                    <div className="stat-label">Total Tickets</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'var(--success-subtle)' }}><CheckCircle color="var(--success)" /></div>
                  <div className="stat-info">
                    <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.resolvedTickets + stats.closedTickets}</div>
                    <div className="stat-label">Resolved / Closed</div>
                  </div>
                </div>
                <div className="stat-card clickable" onClick={() => navigate('/admin/agents')}>
                  <div className="stat-icon" style={{ background: 'var(--warning-subtle)' }}><Headset color="var(--warning)" /></div>
                  <div className="stat-info">
                    <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats.totalAgents}</div>
                    <div className="stat-label">Total Agents</div>
                  </div>
                </div>
                <div className="stat-card clickable" onClick={() => navigate('/admin/users')}>
                  <div className="stat-icon" style={{ background: 'var(--info-subtle)' }}><Users color="var(--info)" /></div>
                  <div className="stat-info">
                    <div className="stat-value" style={{ color: 'var(--info)' }}>{stats.totalUsers}</div>
                    <div className="stat-label">Total Users</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 style={{ marginBottom: 16 }}>Pending Agent Approvals ({pendingAgents.length})</h3>
                {pendingAgents.length === 0 ? (
                  <div className="empty-state card card-sm">
                    <p style={{ color: 'var(--text-muted)' }}>No pending agent registrations.</p>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Date</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingAgents.map(agent => (
                          <tr key={agent.id}>
                            <td><strong>{agent.name}</strong></td>
                            <td>{agent.email}</td>
                            <td>{new Date(agent.createdAt).toLocaleDateString()}</td>
                            <td style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                              <button className="btn btn-sm btn-success" onClick={() => handleAgentDecision(agent.id, 'APPROVE')}>Approve</button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleAgentDecision(agent.id, 'REJECT')}>Reject</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
