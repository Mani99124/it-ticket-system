import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Preloader from './Preloader'

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Preloader />

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  if (roles && !roles.includes(user.role)) {
    const redirectMap = { ADMIN: '/admin', AGENT: '/agent', USER: '/dashboard' }
    return <Navigate to={redirectMap[user.role] || '/login'} replace />
  }

  return children
}

