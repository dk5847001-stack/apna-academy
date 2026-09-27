import { useEffect, useRef, useState } from 'react'
import {
  ArrowBackRounded,
  ArrowForwardRounded,
  CameraAltRounded,
  CheckCircleRounded,
  HeadsetMicRounded,
  MicRounded,
  SecurityRounded,
  SettingsRounded,
  TipsAndUpdatesRounded,
  VideocamRounded,
  WarningAmberRounded,
} from '@mui/icons-material'
import { useInterviewFlow } from '../context/InterviewFlowContext'
import { useInterviewMedia } from '../hooks/useInterviewMedia'
import { useRouter } from '../routes/Router'
import { ROUTES } from '../routes/routes'
import { INTERVIEW_TYPES, EXPERIENCE_LEVELS } from '../data/interviewConfig'
import { interviewApi } from '../services/interviewApi'
import '../styles/interview-preparation-reference.css'

function Brand({ navigate }) {
  return (
    <header className="prep-ref-header">
      <button type="button" className="prep-ref-brand" onClick={() => navigate(ROUTES.HOME)} aria-label="Back to ApnaAcademy">
        <span className="prep-ref-brand-mark">A</span>
        <strong>ApnaAcademy</strong>
        <span>Interview AI</span>
      </button>
      <button type="button" className="prep-ref-help" onClick={() => window.location.assign('mailto:support@apnaacademy.me')}>
        <HeadsetMicRounded /> Need Help?
      </button>
    </header>
  )
}

function ProgressRail() {
  const steps = ['Profile', 'Prepare', 'Interview', 'Results']
  return (
    <div className="prep-ref-progress" aria-label="Interview progress">
      {steps.map((step, index) => (
        <div className={`prep-ref-progress-item ${index === 1 ? 'is-active' : index < 1 ? 'is-complete' : ''`} key={step}>
          <span className="prep-ref-progress-number">{index < 1 ? <CheckCircleRounded /> : index + 1}</span>
          <span className="prep-ref-progress-line" aria-hidden="true" />
          <small>{step}</small>
        </div>
      ))}
    </div>
  )
}

function StatusRow({ icon, label, ready, permission }) {
  return (
    <div className={'prep-ref-status-row ' + (ready ? 'is-ready' : '')}>
      <span className="prep-ref-status-icon">{icon}</span>
      <div>
        <strong>{label}</strong>
        <small>{ready ? 'Ready to use' : permission ? 'Permission needed' : 'Not checked yet'}</small>
      </div>
      <span className="prep-ref-status-check">{ready ? <CheckCircleRounded /> : <span />}</span>
    </div>
  )
}

export default function InterviewPreparationPage() {
  const { setup, setSession } = useInterviewFlow()
  const { navigate } = useRouter()
  const { streamRef, camera, microphone, error, requestMedia } = useInterviewMedia()
  const videoRef = useRef(null)
  const [checking, setChecking] = useState(false)
  const [starting, setStarting] = useState(false)
  const [startError, setStartError] = useState('')

  useEffect(() => {
    if (streamRef.current && videoRef.current) videoRef.current.srcObject = streamRef.current
  }, [camera, microphone, streamRef])

  const checkDevices = async () => {
    setChecking(true)
    const stream = await requestMedia()
    if (stream && videoRef.current) videoRef.current.srcObject = stream
    setChecking(false)
  }

  const start = async () => {
    if (starting) return
    setStarting(true)
    setStartError('')
    try {
      const data = await interviewApi.createInterview(setup)
      setSession({
        id: data.sessionId,
        status: 'in-progress',
        startedAt: new Date().toISOString(),
        setup: data.setup,
        questions: data.questions,
        answers: [],
        currentQuestion: 0,
      })
      navigate(ROUTES.INTERVIEW_ROOM)
    } catch (requestError) {
      setStartError(requestError.message || 'Unable to start the AI interview. Please sign in and try again.')
    } finally {
      setStarting(false)
    }
  }

  const type = INTERVIEW_TYPES.find((item) => item.value === setup.interviewType)
  const experience = EXPERIENCE_LEVELS.find((item) => item.value === setup.experience)
  const devicesReady = camera === 'granted' && microphone === 'granted'

  return (
    <main className="prep-ref-page">
      <Brand navigate={navigate} />
      <div className="prep-ref-ambient prep-ref-ambient-top" aria-hidden="true" />
      <div className="prep-ref-ambient prep-ref-ambient-bottom" aria-hidden="true" />

      <section className="prep-ref-shell">
        <button className="prep-ref-back" type="button" onClick={() => navigate(ROUTES.INTERVIEW_SETUP)}>
          <ArrowBackRounded /> Back to setup
        </button>

        <div className="prep-ref-hero">
          <div>
            <span className="prep-ref-welcome"><span>✦</span> One quick check before we begin</span>
            <h1>Let&apos;s get you <span>interview ready</span></h1>
            <p>We&apos;ll quickly check your camera and microphone, then show you exactly what to expect. No technical knowledge needed.</p>
          </div>
          <div className="prep-ref-hero-illustration" aria-hidden="true">
            <div className="prep-ref-hero-bubble">You&apos;re almost ready!</div>
            <div className="prep-ref-camera-orbit"><VideocamRounded /></div>
            <div className="prep-ref-mic-orbit"><MicRounded /></div>
            <div className="prep-ref-person">
              <span className="prep-ref-person-head" />
              <span className="prep-ref-person-body" />
            </div>
          </div>
        </div>

        <div className="prep-ref-grid">
          <div className="prep-ref-main">
            <section className="prep-ref-card prep-ref-device-card">
              <div className="prep-ref-card-heading">
                <div>
                  <span className="prep-ref-step-icon prep-ref-step-icon--orange"><CameraAltRounded /></span>
                  <div>
                    <h2>Check your camera &amp; microphone</h2>
                    <p>Allow access so the AI interviewer can see and hear you during the practice.</p>
                  </div>
                </div>
                <span className={'prep-ref-check-pill ' + (devicesReady ? 'is-ready' : '')}>
                  {devicesReady ? <CheckCircleRounded /> : <WarningAmberRounded />}
                  {devicesReady ? 'Ready' : 'Check'}
                </span>
              </div>

              <div className="prep-ref-video-wrap">
                {camera === 'granted' ? (
                  <video ref={videoRef} autoPlay muted playsInline />
                ) : (
                  <div className="prep-ref-camera-empty">
                    <span><CameraAltRounded /></span>
                    <strong>Camera preview</strong>
                    <small>Click the button below to allow camera &amp; microphone access.</small>
                  </div>
                )}
                <span className="prep-ref-preview-label"><span /> Live preview</span>
              </div>

              <div className="prep-ref-status-grid">
                <StatusRow icon={<CameraAltRounded />} label="Camera" ready={camera === 'granted'} permission={camera === 'denied'} />
                <StatusRow icon={<MicRounded />} label="Microphone" ready={microphone === 'granted'} permission={microphone === 'denied'} />
              </div>

              {error ? <p className="prep-ref-error">{error}</p> : null}
              {startError ? <p className="prep-ref-error">{startError}</p> : null}

              <button className="prep-ref-device-btn" type="button" onClick={checkDevices} disabled={checking}>
                <SettingsRounded /> {checking ? 'Checking devices…' : devicesReady ? 'Check again' : 'Allow camera & microphone'}
              </button>
            </section>

            <section className="prep-ref-card prep-ref-expect-card">
              <div className="prep-ref-card-heading">
                <div>
                  <span className="prep-ref-step-icon prep-ref-step-icon--blue"><TipsAndUpdatesRounded /></span>
                  <div>
                    <h2>What happens next?</h2>
                    <p>A simple flow designed for first-time interview practice.</p>
                  </div>
                </div>
              </div>
              <div className="prep-ref-expect-grid">
                <div><span>01</span><strong>Meet your AI interviewer</strong><small>Get a short introduction and instructions.</small></div>
                <div><span>02</span><strong>Answer naturally</strong><small>Speak clearly and take your time.</small></div>
                <div><span>03</span><strong>Get useful feedback</strong><small>See your performance after the session.</small></div>
              </div>
            </section>
          </div>

          <aside className="prep-ref-side">
            <div className="prep-ref-side-card">
              <ProgressRail />
              <div className="prep-ref-side-icon"><span><CheckCircleRounded /></span></div>
              <h2>Your setup<br /><span>looks good.</span></h2>
              <p>Review your session details once, then start your practice interview.</p>

              <div className="prep-ref-summary">
                <span className="prep-ref-summary-label">YOUR INTERVIEW</span>
                <strong>{setup.role || 'Your target role'}</strong>
                <div className="prep-ref-summary-pills">
                  <span>{type?.label || 'Technical Interview'}</span>
                  <span>{experience?.shortLabel || 'Fresher'}</span>
                </div>
                <div className="prep-ref-stats">
                  <div><small>Duration</small><strong>{setup.durationMinutes} min</strong></div>
                  <div><small>Questions</small><strong>{setup.questionCount}</strong></div>
                </div>
              </div>

              <div className="prep-ref-security">
                <SecurityRounded />
                <span><strong>Private &amp; secure</strong><small>Your browser controls camera and microphone permissions.</small></span>
              </div>

              <button className="prep-ref-start" type="button" onClick={start} disabled={starting}>
                <span>{starting ? 'Creating your interview…' : 'Start AI Interview'}</span>
                {starting ? null : <ArrowForwardRounded />}
              </button>
              <button className="prep-ref-edit" type="button" onClick={() => navigate(ROUTES.INTERVIEW_SETUP)}>Edit configuration</button>
            </div>
          </aside>
        </div>

        <div className="prep-ref-tip">
          <TipsAndUpdatesRounded />
          <div><strong>Interview tip</strong><span>Speak naturally, think out loud, and use specific examples. You can take a moment before answering.</span></div>
        </div>
      </section>
    </main>
  )
}
