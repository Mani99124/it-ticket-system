import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import authService from '../services/authService'
import toast from 'react-hot-toast'
import { Ticket, User, Mail, Lock, Loader2 } from 'lucide-react'

export default function RegisterPage({ isAgent = false }) {
  const navigate = useNavigate()
  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isAgent) {
        await authService.registerAgent(form)
        toast.success('Agent registration submitted! Awaiting admin approval.')
        navigate('/login')
      } else {
        await authService.registerUser(form)
        toast.success('Registration successful! You can now log in.')
        navigate('/login')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
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
          <h1 className="auth-title">{isAgent ? 'Agent Registration' : 'Create Account'}</h1>
          <p className="auth-subtitle">
            {isAgent ? 'Apply to become an IT support agent' : 'Join the IT Ticket Resolution System'}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
              <input id="reg-name" type="text" name="name" required
                className="form-control" style={{ paddingLeft: 40 }}
                placeholder="John Doe" value={form.name} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
              <input id="reg-email" type="email" name="email" required
                className="form-control" style={{ paddingLeft: 40 }}
                placeholder="you@company.com" value={form.email} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
              <input id="reg-password" type="password" name="password" required minLength={6}
                className="form-control" style={{ paddingLeft: 40 }}
                placeholder="Min 6 characters" value={form.password} onChange={handleChange} />
            </div>
          </div>

          {isAgent && (
            <div style={{ padding:'12px 14px', borderRadius:'var(--radius-md)', background:'var(--warning-subtle)', border:'1px solid rgba(245,158,11,0.2)', fontSize:'0.825rem', color:'var(--warning)' }}>
              ⚠️ Agent accounts require admin approval before you can log in.
            </div>
          )}

          <button id="reg-submit" type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
            {loading && <Loader2 size={18} style={{ animation:'spin 0.7s linear infinite' }} />}
            {loading ? 'Creating account…' : isAgent ? 'Submit Application' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </div>
        {!isAgent && (
          <div className="auth-footer" style={{ marginTop: 8 }}>
            Are you an IT agent?{' '}
            <Link to="/register/agent" className="auth-link">Register as Agent</Link>
          </div>
        )}
      </div>
    </div>
  )
}
