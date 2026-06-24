import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import authService from '../services/authService'
import toast from 'react-hot-toast'
import { Ticket, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authService.login(form)
      const data = res.data.data
      login(data)
      toast.success(`Welcome back, ${data.name}!`)
      const redirectMap = { ADMIN: '/admin', AGENT: '/agent', USER: '/dashboard' }
      navigate(redirectMap[data.role] || '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Ticket size={28} color="#fff" />
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your IT Ticket account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
              <input
                id="login-email"
                type="email" name="email" required
                className="form-control" style={{ paddingLeft: 40 }}
                placeholder="you@company.com"
                value={form.email} onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'} name="password" required
                className="form-control" style={{ paddingLeft: 40, paddingRight: 40 }}
                placeholder="••••••••"
                value={form.password} onChange={handleChange}
              />
              <button type="button" onClick={() => setShowPw(p => !p)}
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button id="login-submit" type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin-icon" style={{ animation:'spin 0.7s linear infinite' }} /> : null}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Create one</Link>
        </div>
        <div className="auth-footer" style={{ marginTop: 8 }}>
          Are you an IT agent?{' '}
          <Link to="/register/agent" className="auth-link">Register as Agent</Link>
        </div>
        <div className="auth-footer" style={{ marginTop: 8 }}>
          <Link to="/about" className="auth-link">Learn more about this system</Link>
        </div>
      </div>
    </div>
  )
}
