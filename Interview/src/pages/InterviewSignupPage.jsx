import { useEffect, useState } from 'react'
import {
  ArrowBackRounded,
  ArrowForwardRounded,
  AutoAwesomeRounded,
  CheckCircleRounded,
  EmailRounded,
  LockRounded,
  PersonRounded,
  SecurityRounded,
  ShieldRounded,
  VisibilityRounded,
  VisibilityOffRounded,
} from '@mui/icons-material'
import { useRouter } from '../routes/Router'
import { ROUTES } from '../routes/routes'
import { useAuth } from '../context/AuthContext'
import CosmicField from '../components/common/CosmicField'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '')

const getReferralCode = () => {
  try {
    const value = new URLSearchParams(window.location.search).get('ref')
    return String(value || '').trim().toUpperCase().slice(0, 32)
  } catch {
    return ''
  }
}

const errorMessage = (response, data) => {
  if (response?.status === 409) return data?.message || 'An account with this email already exists.'
  if (response?.status === 429) return data?.message || 'Too many requests. Please wait and try again.'
  if (response?.status === 503) return data?.message || 'Email verification is temporarily unavailable.'
  return data?.message || data?.error?.message || 'Unable to complete registration. Please try again.'
}

export default function InterviewSignupPage() {
  const { navigate } = useRouter()
  const { user, loading: authLoading, refreshAuth } = useAuth()
  const [step, setStep] = useState('details')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [referralCode, setReferralCode] = useState('')

  useEffect(() => {
    const fromUrl = getReferralCode()
    if (fromUrl) {
      sessionStorage.setItem('apnaacademy_referral_code', fromUrl)
      setReferralCode(fromUrl)
      return
    }
    setReferralCode(sessionStorage.getItem('apnaacademy_referral_code') || '')
  }, [])

  useEffect(() => {
    if (!authLoading && user) navigate(ROUTES.INTERVIEW_SETUP, { replace: true })
  }, [authLoading, user, navigate])

  useEffect(() => {
    if (countdown <= 0) return undefined
    const timer = window.setInterval(() => setCountdown((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [countdown])

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
    setSuccess('')
  }

  const validate = () => {
    const name = form.name.trim()
    const email = form.email.trim().toLowerCase()
    if (name.length < 2) return 'Name must contain at least 2 characters.'
    if (name.length > 100) return 'Name must not exceed 100 characters.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.'
    if (form.password.length < 8) return 'Password must contain at least 8 characters.'
    if (form.password.length > 128) return 'Password must not exceed 128 characters.'
    if (form.password !== form.confirmPassword) return 'Passwords do not match.'
    return ''
  }

  const register = async (event) => {
    event.preventDefault()
    if (loading) return
    const validation = validate()
    if (validation) {
      setError(validation)
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(API_BASE + '/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          ...(referralCode ? { referralCode } : {}),
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(errorMessage(response, data))

      const result = data?.data
      if (!result?.requiresEmailVerification) throw new Error('The server did not start email verification.')

      setStep('otp')
      setOtp('')
      setCountdown(Number(result?.verification?.resendAvailableInSeconds) || 60)
      setSuccess('Verification code sent. Check your email to continue.')
    } catch (requestError) {
      setError(requestError.message || 'Unable to complete registration.')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (event) => {
    event.preventDefault()
    const normalizedOtp = otp.replace(/\D/g, '').slice(0, 6)
    setOtp(normalizedOtp)

    if (normalizedOtp.length !== 6) {
      setError('Please enter the 6-digit verification code.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(API_BASE + '/auth/register/verify-otp', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          otp: normalizedOtp,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(errorMessage(response, data))

      sessionStorage.removeItem('apnaacademy_referral_code')
      await refreshAuth()
      setSuccess('Email verified successfully. Opening your interview workspace...')
      window.setTimeout(() => navigate(ROUTES.INTERVIEW_SETUP), 450)
    } catch (requestError) {
      setError(requestError.message || 'Unable to verify the email.')
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    if (resending || countdown > 0) return
    setResending(true)
    setError('')
    setSuccess('')
    try {
      const response = await fetch(API_BASE + '/auth/register/resend-otp', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim().toLowerCase() }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(errorMessage(response, data))
      setCountdown(Number(data?.data?.verification?.resendAvailableInSeconds || data?.data?.resendAvailableInSeconds) || 60)
      setSuccess('A new verification code has been sent.')
    } catch (requestError) {
      setError(requestError.message || 'Unable to resend the code.')
    } finally {
      setResending(false)
    }
  }

  if (authLoading || user) {
    return (
      <main className="cosmic-auth-page cosmic-signup-page">
        <CosmicField density="room" />
        <div className="auth-loading">Checking your account…</div>
      </main>
    )
  }

  return (
    <main className="cosmic-auth-page cosmic-signup-page">
      <CosmicField density="room" />
      <div className="signup-glow signup-glow-a" />
      <div className="signup-glow signup-glow-b" />

      <section className="signup-experience">
        <div className="signup-story">
          <button type="button" className="signup-back" onClick={() => navigate(ROUTES.HOME)}>
            <ArrowBackRounded /> Back to Interview AI
          </button>
          <span className="login-story-badge"><AutoAwesomeRounded /> AI INTERVIEW LAB</span>
          <h1>Create your space. Practice without limits.</h1>
          <p>Build one secure ApnaAcademy account for realistic AI interviews, saved sessions and performance insights.</p>

          <div className="login-story-points">
            <div><span><AutoAwesomeRounded /></span><div><strong>Adaptive interviews</strong><small>Questions respond naturally to your answers.</small></div></div>
            <div><span><SecurityRounded /></span><div><strong>Email-verified account</strong><small>Your account is activated after verification.</small></div></div>
            <div><span><CheckCircleRounded /></span><div><strong>Saved progress</strong><small>Keep your interview history in one place.</small></div></div>
          </div>
        </div>

        <section className="signup-card">
          <div className="signup-brand">
            <span><AutoAwesomeRounded /></span>
            <div><strong>ApnaAcademy</strong><small>Interview AI</small></div>
          </div>

          {step === 'details' ? (
            <>
              <span className="room-eyebrow"><ShieldRounded /> SECURE SIGN UP</span>
              <h2>Create your account.</h2>
              <p>Enter your details and we’ll send a one-time code to verify your email.</p>

              {error ? <div className="auth-error">{error}</div> : null}
              {success ? <div className="auth-success">{success}</div> : null}

              <form onSubmit={register} className="signup-form">
                <label>Full name</label>
                <div className="signup-input"><PersonRounded /><input value={form.name} onChange={(e) => update('name', e.target.value)} autoComplete="name" placeholder="Your full name" maxLength={100} required /></div>

                <label>Email address</label>
                <div className="signup-input"><EmailRounded /><input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} autoComplete="email" placeholder="you@example.com" required /></div>

                <label>Password</label>
                <div className="signup-input"><LockRounded /><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => update('password', e.target.value)} autoComplete="new-password" placeholder="Minimum 8 characters" maxLength={128} required /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <VisibilityOffRounded /> : <VisibilityRounded />}</button></div>

                <label>Confirm password</label>
                <div className="signup-input"><LockRounded /><input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} autoComplete="new-password" placeholder="Repeat your password" maxLength={128} required /><button type="button" onClick={() => setShowConfirm((value) => !value)} aria-label={showConfirm ? 'Hide password' : 'Show password'}>{showConfirm ? <VisibilityOffRounded /> : <VisibilityRounded />}</button></div>

                <button className="gradient-btn signup-submit" disabled={loading}>
                  {loading ? 'Creating account…' : 'Continue to verification'}
                  {!loading && <ArrowForwardRounded />}
                </button>
              </form>

              <div className="signup-switch">Already have an account? <button type="button" onClick={() => navigate(ROUTES.LOGIN)}>Sign in</button></div>
              <div className="signup-secure-note"><ShieldRounded /> Your password is never included in the verification email.</div>
            </>
          ) : (
            <>
              <button type="button" className="signup-otp-back" onClick={() => { setStep('details'); setError(''); setSuccess('') }} disabled={loading || resending}>
                <ArrowBackRounded /> Edit details
              </button>
              <span className="room-eyebrow"><EmailRounded /> EMAIL VERIFICATION</span>
              <h2>Enter your 6-digit code.</h2>
              <p>We sent a verification code to <strong>{form.email.trim().toLowerCase()}</strong>.</p>

              {error ? <div className="auth-error">{error}</div> : null}
              {success ? <div className="auth-success">{success}</div> : null}

              <form onSubmit={verifyOtp} className="signup-form">
                <label>Verification code</label>
                <div className="signup-input signup-otp-input"><EmailRounded /><input autoFocus inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); setSuccess('') }} placeholder="000000" maxLength={6} required /></div>
                <button className="gradient-btn signup-submit" disabled={loading || otp.length !== 6}>
                  {loading ? 'Verifying…' : 'Verify & create account'}
                  {!loading && <CheckCircleRounded />}
                </button>
              </form>

              <div className="signup-resend">
                <span>Didn’t receive the code? Check spam/promotions.</span>
                <button type="button" onClick={resend} disabled={resending || countdown > 0}>
                  {resending ? 'Sending new code…' : countdown > 0 ? `Resend available in ${countdown}s` : 'Resend verification code'}
                </button>
              </div>
              <div className="signup-secure-note"><ShieldRounded /> Verification codes expire after 10 minutes.</div>
            </>
          )}
        </section>
      </section>
    </main>
  )
}
