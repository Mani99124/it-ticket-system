import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Ticket, PlusCircle, Users,
  BarChart3, LogOut, Headset, ShieldCheck, ChevronRight, Menu, X
} from 'lucide-react'

const navConfig = {
  USER: [
    { label: 'Dashboard',      icon: LayoutDashboard, path: '/dashboard' },
    { label: 'My Tickets',     icon: Ticket,          path: '/tickets' },
    { label: 'Create Ticket',  icon: PlusCircle,      path: '/tickets/new' },
    { label: 'About',          icon: ShieldCheck,    path: '/about' },
  ],
  AGENT: [
    { label: 'Dashboard',      icon: LayoutDashboard, path: '/agent' },
    { label: 'My Tickets',     icon: Ticket,          path: '/agent/tickets' },
    { label: 'About',          icon: ShieldCheck,    path: '/about' },
  ],
  ADMIN: [
    { label: 'Dashboard',      icon: BarChart3,       path: '/admin' },
    { label: 'All Tickets',    icon: Ticket,          path: '/admin/tickets' },
    { label: 'Agents',         icon: Headset,         path: '/admin/agents' },
    { label: 'Users',          icon: Users,           path: '/admin/users' },
    { label: 'About',          icon: ShieldCheck,    path: '/about' },
  ],
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  const items = navConfig[user.role] || []
  const initial = user.name?.charAt(0)?.toUpperCase() || '?'

  const roleIcon = { USER: null, AGENT: <Headset size={14} />, ADMIN: <ShieldCheck size={14} /> }

  const handleNavigate = (path) => {
    navigate(path)
    setIsOpen(false)
  }

  const handleLogout = () => {
    setIsOpen(false)
    logout()
  }

  return (
    <>
      <button
        type="button"
        className="sidebar-toggle"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {isOpen && <button type="button" className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setIsOpen(false)} />}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Ticket size={18} color="#fff" />
          </div>
          <div>
            <div className="sidebar-logo-text">IT Tickets</div>
            <div className="sidebar-logo-sub">Resolution System</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {items.map(item => {
            const Icon = item.icon
            const active = location.pathname === item.path ||
                            (item.path !== '/dashboard' && item.path !== '/agent' && item.path !== '/admin' &&
                             location.pathname.startsWith(item.path))
            return (
              <button
                key={item.path}
                className={`nav-item ${active ? 'active' : ''}`}
                onClick={() => handleNavigate(item.path)}
              >
                <Icon size={18} />
                {item.label}
                {active && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
              </button>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="user-pill" onClick={handleLogout} title="Click to logout">
            <div className="user-avatar">{initial}</div>
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-role" style={{ display:'flex', alignItems:'center', gap:4 }}>
                {roleIcon[user.role]} {user.role}
              </div>
            </div>
            <LogOut size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </button>
        </div>
      </aside>
    </>
  )
}
