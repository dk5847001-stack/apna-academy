import { useState } from 'react'
import { ArrowForwardRounded, AutoAwesomeRounded, LockRounded, MailOutlineRounded, ShieldRounded, BoltRounded } from '@mui/icons-material'
import { useRouter } from '../routes/Router'
import { ROUTES } from '../routes/routes'
import { useAuth } from '../context/AuthContext'
import CosmicField from '../components/common/CosmicField'

export default function InterviewLoginPage() {
  const { navigate } = useRouter()
  const { login, user, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!authLoading && user) {
    navigate(ROUTES.INTERVIEW_SETUP, { replace: true })
    return null
  }

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login({ email: email.trim().toLowerCase(), password })
      navigate(ROUTES.INTERVIEW_SETUP, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="interview-login-page cosmic-login-page">
      <CosmicField density="room" />
      <div className="login-glow login-glow-a" />
      <div className="login-glow login-glow-b" />

      <section className="login-experience">
        <div className="login-story">
          <span className="login-story-badge"><AutoAwesomeRounded /> AI INTERVIEW LAB</span>
          <h1>Walk into a smarter interview room.</h1>
          <p>Prepare with realistic AI interviews, adaptive follow-up questions and session insights designed around your target role.</p>

          <div className="login-story-points">
            <div><span><BoltRounded /></span><div><strong>Adaptive AI</strong><small>Questions respond to your answers.</small></div></div>
            <div><span><ShieldRounded /></span><div><strong>Private sessions</strong><small>Your interview practice stays protected.</small></div></div>
          </div>

          <button className="login-story-link" onClick={() => navigate(ROUTES.HOME)}>Explore Interview AI <ArrowForwardRounded /></button>
        </div>

        <section className="interview-login-card">
          <div className="login-brand"><span><AutoAwesomeRounded /></span><strong>ApnaAcademy</strong><small>Interview AI</small></div>
          <span className="room-eyebrow"><LockRounded /> SECURE SIGN IN</span>
          <h2>Continue your AI interview practice.</h2>
          <p>Sign in to create, continue and save your interview sessions.</p>

          <form onSubmit={submit}>
            <label>Email address</label>
            <div className="login-input"><MailOutlineRounded /><input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" /></div>
            <label>Password</label>
            <div className="login-input"><LockRounded /><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required autoComplete="current-password" placeholder="Your password" /></div>
            {error ? <div className="prep-error">{error}</div> : null}
            <button className="gradient-btn login-submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'} {!loading && <ArrowForwardRounded />}</button>
          </form>

          <div className="login-register-link">New to ApnaAcademy? <button type="button" onClick={() => navigate(ROUTES.SIGNUP)}>Create an account</button></div>
          <button className="login-home" onClick={()=>navigate(ROUTES.HOME)}>Back to Interview AI</button>
          <div className="login-secure-note"><ShieldRounded /> Secure account authentication</div>
        </section>
      </section>
    </main>
  )
}
