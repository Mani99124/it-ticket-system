import { useEffect, useState } from 'react'
import adminService from '../services/adminService'
import Sidebar from '../components/common/Sidebar'
import StatusBadge from '../components/common/StatusBadge'
import toast from 'react-hot-toast'
import { Users, Trash2 } from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await adminService.getUsers()
      setUsers(res.data.data)
    } catch (err) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return
    try {
      await adminService.deactivateUser(id)
      toast.success('User deactivated')
      fetchUsers()
    } catch (err) {
      toast.error('Failed to deactivate user')
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">User Management</h1>
            <p className="page-subtitle">View and manage system users</p>
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
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      users.map(u => (
                        <tr key={u.id}>
                          <td><strong>{u.name}</strong></td>
                          <td>{u.email}</td>
                          <td><StatusBadge value={u.status} /></td>
                          <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeactivate(u.id)}
                              disabled={u.status === 'DEACTIVATED'}
                            >
                              <Trash2 size={14} style={{ marginRight: 4 }} />
                              Deactivate
                            </button>
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
