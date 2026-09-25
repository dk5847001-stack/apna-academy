import { useEffect, useRef, useState } from 'react'
import { ArrowBackRounded, ArrowForwardRounded, CameraAltRounded, CheckCircleRounded, SecurityRounded, SettingsRounded, TipsAndUpdatesRounded } from '@mui/icons-material'
import { useInterviewFlow } from '../context/InterviewFlowContext'
import { useInterviewMedia } from '../hooks/useInterviewMedia'
import { useRouter } from '../routes/Router'
import { ROUTES } from '../routes/routes'
import { INTERVIEW_TYPES, EXPERIENCE_LEVELS } from '../data/interviewConfig'

export default function InterviewPreparationPage() {
  const { setup, setSession } = useInterviewFlow()
  const { navigate } = useRouter()
  const { streamRef, camera, microphone, error, requestMedia } = useInterviewMedia()
  const videoRef = useRef(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (streamRef.current && videoRef.current) videoRef.current.srcObject = streamRef.current
  }, [camera, microphone, streamRef])

  const checkDevices = async () => {
    setChecking(true)
    const stream = await requestMedia()
    if (stream && videoRef.current) videoRef.current.srcObject = stream
    setChecking(false)
  }

  const start = () => {
    setSession({
      id: 'mock-' + Date.now(),
      status: 'in-progress',
      startedAt: new Date().toISOString(),
      setup,
      answers: [],
      currentQuestion: 0,
    })
    navigate(ROUTES.INTERVIEW_ROOM)
  }

  const type = INTERVIEW_TYPES.find((item) => item.value === setup.interviewType)
  const experience = EXPERIENCE_LEVELS.find((item) => item.value === setup.experience)

  return (
    <main className="prep-page">
      <div className="room-orb room-orb-a" /><div className="room-orb room-orb-b" />
      <section className="prep-shell">
        <button className="room-back-link" type="button" onClick={() => navigate(ROUTES.INTERVIEW_SETUP)}><ArrowBackRounded /> Back to setup</button>
        <div className="prep-heading">
          <span className="room-eyebrow"><TipsAndUpdatesRounded /> Final check before you start</span>
          <h1>Your interview room is ready.</h1>
          <p>Check your camera and microphone, review your session, then enter the AI interview.</p>
        </div>
        <div className="prep-grid">
          <section className="prep-device-card">
            <div className="prep-video">
              {camera === 'granted' ? <video ref={videoRef} autoPlay muted playsInline /> : <div className="prep-camera-empty"><CameraAltRounded /><strong>Camera preview</strong><span>Allow camera access to see yourself here.</span></div>}
              <span className="prep-preview-badge"><span /> Preview</span>
            </div>
            <div className="prep-device-status">
              <div><span className={camera === 'granted' ? 'status-dot ready' : 'status-dot'} /><strong>Camera</strong><small>{camera === 'granted' ? 'Ready' : 'Not checked'}</small></div>
              <div><span className={microphone === 'granted' ? 'status-dot ready' : 'status-dot'} /><strong>Microphone</strong><small>{microphone === 'granted' ? 'Ready' : 'Not checked'}</small></div>
            </div>
            {error ? <p className="prep-error">{error}</p> : null}
            <button className="device-check-btn" type="button" onClick={checkDevices} disabled={checking}><SettingsRounded /> {checking ? 'Checking devices…' : 'Check camera & microphone'}</button>
          </section>
          <aside className="prep-summary-card">
            <span className="room-card-label">SESSION SUMMARY</span>
            <h2>{setup.role || 'Your target role'}</h2>
            <div className="prep-summary-pills"><span>{type?.label || 'Technical Interview'}</span><span>{experience?.shortLabel || 'Fresher'}</span></div>
            <div className="prep-stat-grid"><div><small>Duration</small><strong>{setup.durationMinutes} min</strong></div><div><small>Questions</small><strong>{setup.questionCount}</strong></div><div><small>Difficulty</small><strong>{setup.difficulty}</strong></div></div>
            <div className="prep-rules">
              <span><CheckCircleRounded /> Questions adapt to your answers.</span>
              <span><CheckCircleRounded /> You can pause between questions.</span>
              <span><SecurityRounded /> Your browser controls camera access.</span>
            </div>
            <button className="gradient-btn prep-start-btn" type="button" onClick={start}><span>Start AI Interview</span><ArrowForwardRounded /></button>
            <button className="prep-cancel-btn" type="button" onClick={() => navigate(ROUTES.INTERVIEW_SETUP)}>Edit configuration</button>
          </aside>
        </div>
        <div className="prep-tip"><TipsAndUpdatesRounded /><div><strong>Interview tip</strong><span>Speak clearly, think out loud, and use specific examples. The AI will ask follow-up questions when useful.</span></div></div>
      </section>
    </main>
  )
}
