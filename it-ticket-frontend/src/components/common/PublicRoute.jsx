import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Preloader from './Preloader'

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <Preloader />

  if (user) {
    const redirectMap = { ADMIN: '/admin', AGENT: '/agent', USER: '/dashboard' }
    return <Navigate to={redirectMap[user.role] || '/dashboard'} replace />
  }

  return children
}

