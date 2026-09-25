import { useState } from 'react'
import { ArrowForwardRounded, AutoAwesomeRounded, LockRounded, MailOutlineRounded } from '@mui/icons-material'
import { useRouter } from '../routes/Router'
import { ROUTES } from '../routes/routes'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '')

export default function InterviewLoginPage() {
  const { navigate } = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true); setError('')
    try {
      const response = await fetch(API_BASE + '/auth/login', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Login failed.')
      navigate(ROUTES.INTERVIEW_SETUP)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  return <main className="interview-login-page"><div className="login-glow login-glow-a" /><div className="login-glow login-glow-b" /><section className="interview-login-card"><div className="login-brand"><span><AutoAwesomeRounded /></span><strong>ApnaAcademy</strong><small>Interview AI</small></div><span className="room-eyebrow"><AutoAwesomeRounded /> SECURE SIGN IN</span><h1>Continue your AI interview practice.</h1><p>Sign in with your ApnaAcademy account to create and save interview sessions.</p><form onSubmit={submit}><label>Email address</label><div className="login-input"><MailOutlineRounded /><input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" /></div><label>Password</label><div className="login-input"><LockRounded /><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required autoComplete="current-password" placeholder="Your password" /></div>{error ? <div className="prep-error">{error}</div> : null}<button className="gradient-btn login-submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'} {!loading && <ArrowForwardRounded />}</button></form><button className="login-home" onClick={()=>navigate(ROUTES.HOME)}>Back to Interview AI</button></section></main>
}
