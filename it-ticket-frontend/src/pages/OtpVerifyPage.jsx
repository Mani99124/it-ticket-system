import { useState, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import authService from '../services/authService'
import toast from 'react-hot-toast'
import { Ticket, ShieldCheck, Loader2, RefreshCw } from 'lucide-react'

export default function OtpVerifyPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const email     = location.state?.email || ''
  const [otp, setOtp]         = useState(['', '', '', '', '', ''])
  const [loading, setLoading]   = useState(false)
  const [resending, setResending] = useState(false)
  const inputs = useRef([])

  const handleChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[idx] = val.slice(-1)
    setOtp(next)
    if (val && idx < 5) inputs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputs.current[idx - 1]?.focus()
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) { toast.error('Please enter the complete 6-digit OTP'); return }
    setLoading(true)
    try {
      await authService.verifyOtp({ email, otp: code })
      toast.success('Email verified! You can now sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification failed')
      setOtp(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await authService.resendOtp({ email })
      toast.success('New OTP sent to your email')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not resend OTP')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <ShieldCheck size={28} color="#fff" />
          </div>
          <h1 className="auth-title">Verify your email</h1>
          <p className="auth-subtitle">
            We sent a 6-digit code to<br />
            <strong style={{ color:'var(--accent-light)' }}>{email || 'your email'}</strong>
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="otp-inputs">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-digit-${i}`}
                ref={el => inputs.current[i] = el}
                type="text" inputMode="numeric" maxLength={1}
                className="otp-input"
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                autoFocus={i === 0}
              />
            ))}
          </div>

          <button id="otp-submit" type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
            {loading && <Loader2 size={18} style={{ animation:'spin 0.7s linear infinite' }} />}
            {loading ? 'Verifying…' : 'Verify Email'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: 20 }}>
          Didn't receive the code?{' '}
          <button id="otp-resend" onClick={handleResend} disabled={resending}
            style={{ background:'none', border:'none', color:'var(--accent-light)', fontWeight:500, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:4 }}>
            {resending ? <><Loader2 size={13} style={{ animation:'spin 0.7s linear infinite' }} /> Sending…</> : <><RefreshCw size={13} /> Resend OTP</>}
          </button>
        </div>

        <div className="auth-footer" style={{ marginTop: 8 }}>
          <Link to="/login" className="auth-link">← Back to Login</Link>
        </div>
      </div>
    </div>
  )
}
