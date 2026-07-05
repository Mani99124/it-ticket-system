import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import OtpVerifyPage from './pages/OtpVerifyPage'
import DashboardPage from './pages/DashboardPage'
import CreateTicketPage from './pages/CreateTicketPage'
import TicketDetailPage from './pages/TicketDetailPage'
import AgentDashboardPage from './pages/AgentDashboardPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminAgentsPage from './pages/AdminAgentsPage'
import MyTicketsPage from './pages/MyTicketsPage'
import AgentTicketsPage from './pages/AgentTicketsPage'
import AdminTicketsPage from './pages/AdminTicketsPage'
import AboutPage from './pages/AboutPage'
import ProtectedRoute from './components/common/ProtectedRoute'
import PublicRoute from './components/common/PublicRoute'
import Preloader from './components/common/Preloader'
import { useAuth } from './context/AuthContext'

export default function App() {
  const { loading } = useAuth()

  if (loading) return <Preloader />

  return (
    <Routes>
      <Route path="/" element={
        <PublicRoute>
          <Navigate to="/login" replace />
        </PublicRoute>
      } />
      
      {/* Public Auth */}
      <Route path="/login" element={
        <PublicRoute><LoginPage /></PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute><RegisterPage isAgent={false} /></PublicRoute>
      } />
      <Route path="/register/agent" element={
        <PublicRoute><RegisterPage isAgent={true} /></PublicRoute>
      } />
      <Route path="/verify-otp" element={
        <PublicRoute><OtpVerifyPage /></PublicRoute>
      } />
      <Route path="/about" element={<AboutPage />} />

      {/* USER Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute roles={['USER']}><DashboardPage /></ProtectedRoute>
      } />
      <Route path="/tickets" element={
        <ProtectedRoute roles={['USER']}><MyTicketsPage /></ProtectedRoute>
      } />
      <Route path="/tickets/new" element={
        <ProtectedRoute roles={['USER', 'ADMIN']}><CreateTicketPage /></ProtectedRoute>
      } />
      <Route path="/tickets/:id" element={
        <ProtectedRoute roles={['USER', 'ADMIN']}><TicketDetailPage /></ProtectedRoute>
      } />

      {/* AGENT Routes */}
      <Route path="/agent" element={
        <ProtectedRoute roles={['AGENT']}><AgentDashboardPage /></ProtectedRoute>
      } />
      <Route path="/agent/tickets" element={
        <ProtectedRoute roles={['AGENT']}><AgentTicketsPage /></ProtectedRoute>
      } />
      <Route path="/agent/tickets/:id" element={
        <ProtectedRoute roles={['AGENT']}><TicketDetailPage /></ProtectedRoute>
      } />

      {/* ADMIN Routes */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['ADMIN']}><AdminDashboardPage /></ProtectedRoute>
      } />
      <Route path="/admin/tickets" element={
        <ProtectedRoute roles={['ADMIN']}><AdminTicketsPage /></ProtectedRoute>
      } />
      <Route path="/admin/tickets/:id" element={
        <ProtectedRoute roles={['ADMIN']}><TicketDetailPage /></ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute roles={['ADMIN']}><AdminUsersPage /></ProtectedRoute>
      } />
      <Route path="/admin/agents" element={
        <ProtectedRoute roles={['ADMIN']}><AdminAgentsPage /></ProtectedRoute>
      } />
      
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}




