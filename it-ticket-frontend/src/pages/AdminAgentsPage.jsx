import { useEffect, useState } from 'react'
import adminService from '../services/adminService'
import Sidebar from '../components/common/Sidebar'
import StatusBadge from '../components/common/StatusBadge'
import toast from 'react-hot-toast'
import { Headset, Trash2, CheckCircle, XCircle } from 'lucide-react'

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const res = await adminService.getAgents()
      setAgents(res.data.data)
    } catch (err) {
      toast.error('Failed to load agents')
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
      fetchAgents()
    } catch (err) {
      toast.error(`Failed to ${action.toLowerCase()} agent`)
    }
  }

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this agent?')) return
    try {
      await adminService.deactivateUser(id)
      toast.success('Agent deactivated')
      fetchAgents()
    } catch (err) {
      toast.error('Failed to deactivate agent')
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">Agent Management</h1>
            <p className="page-subtitle">View and manage support agents</p>
          </div>

          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : (
            <div className="card">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          No agents found.
                        </td>
                      </tr>
                    ) : (
                      agents.map(a => (
                        <tr key={a.id}>
                          <td><strong>{a.name}</strong></td>
                          <td>{a.email}</td>
                          <td><StatusBadge value={a.status} /></td>
                          <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                          <td style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            {a.status === 'PENDING' && (
                              <>
                                <button 
                                  className="btn btn-sm btn-success" 
                                  onClick={() => handleAgentDecision(a.id, 'APPROVE')}
                                >
                                  <CheckCircle size={14} style={{ marginRight: 4 }} />
                                  Approve
                                </button>
                                <button 
                                  className="btn btn-sm btn-danger" 
                                  onClick={() => handleAgentDecision(a.id, 'REJECT')}
                                >
                                  <XCircle size={14} style={{ marginRight: 4 }} />
                                  Reject
                                </button>
                              </>
                            )}
                            {a.status === 'ACTIVE' && (
                                <button 
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleDeactivate(a.id)}
                                >
                                  <Trash2 size={14} style={{ marginRight: 4 }} />
                                  Deactivate
                                </button>
                            )}
                            {a.status === 'DEACTIVATED' && (
                                <button 
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleAgentDecision(a.id, 'APPROVE')}
                                >
                                  Reactivate
                                </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
