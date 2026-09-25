import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AccessTimeRounded, ArrowBackRounded, AutoAwesomeRounded, ChatRounded, CheckCircleRounded,
  ChevronLeftRounded, ChevronRightRounded, CloseRounded, ExpandRounded, KeyboardVoiceRounded,
  MicOffRounded, MicRounded, MoreHorizRounded, PauseRounded, PlayArrowRounded, SendRounded,
  StopCircleRounded, VideocamOffRounded, VideocamRounded, VolumeUpRounded, WarningAmberRounded,
} from '@mui/icons-material'
import { useInterviewFlow } from '../context/InterviewFlowContext'
import { buildMockQuestions } from '../data/mockInterview'
import { useInterviewMedia } from '../hooks/useInterviewMedia'
import { useInterviewTimer } from '../hooks/useInterviewTimer'
import { interviewApi } from '../services/interviewApi'
import { useRouter } from '../routes/Router'
import { ROUTES } from '../routes/routes'

export default function InterviewRoomPage() {
  const { setup, session, setSession } = useInterviewFlow()
  const { navigate } = useRouter()
  const { streamRef, camera, microphone, requestMedia, toggleCamera, toggleMicrophone } = useInterviewMedia()
  const questions = useMemo(() => session?.questions?.length ? session.questions : buildMockQuestions(setup), [session?.questions, setup])
  const [current, setCurrent] = useState(Number(session?.currentQuestion) || 0)
  const [answer, setAnswer] = useState('')
  const [answers, setAnswers] = useState(session?.answers || [])
  const [paused, setPaused] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showEnd, setShowEnd] = useState(false)
  const [showQuestionList, setShowQuestionList] = useState(false)
  const videoRef = useRef(null)
  const timer = useInterviewTimer(Math.max(60, Number(setup.durationMinutes || 30) * 60), true)

  useEffect(() => {
    requestMedia().then((stream) => {
      if (stream && videoRef.current) videoRef.current.srcObject = stream
    })
  }, [requestMedia])

  useEffect(() => {
    if (streamRef.current && videoRef.current) videoRef.current.srcObject = streamRef.current
  }, [camera, microphone, streamRef])

  useEffect(() => {
    if (timer.remaining === 0) navigate(ROUTES.INTERVIEW_COMPLETE)
  }, [timer.remaining, navigate])

  useEffect(() => {
    if (paused) timer.pause()
  }, [paused, timer])

  useEffect(() => {
    setSession((value) => ({ ...(value || {}), currentQuestion: current, answers }))
  }, [current, answers, setSession])

  const question = questions[current] || questions[0]
  const answeredCount = answers.filter((item) => item?.answer?.trim()).length
  const progress = Math.round(((current + 1) / questions.length) * 100)
  const isAnswered = answers.some((item) => item.questionId === question?.id && item.answer?.trim())

  const saveAnswer = async () => {
    if (!question || !answer.trim() || submitting) return null
    setSubmitting(true)
    try {
      if (!session?.id || String(session.id).startsWith('mock-')) throw new Error('Your AI session is not available. Please restart the interview.')
      const data = await interviewApi.submitInterviewAnswer({ sessionId: session.id, questionId: question.id, answer: answer.trim() })
      const saved = { questionId: question.id, answer: answer.trim(), score: data.evaluation?.score, feedback: data.evaluation?.feedback, answeredAt: new Date().toISOString() }
      const nextAnswers = answers.filter((item) => item.questionId !== question.id).concat(saved)
      setAnswers(nextAnswers)
      setSession((value) => ({ ...(value || {}), answers: nextAnswers, result: data.result || value?.result, status: data.completed ? 'completed' : 'in-progress' }))
      setAnswer('')
      return data
    } finally { setSubmitting(false) }
  }

  const nextQuestion = async () => {
    const data = answer.trim() ? await saveAnswer() : null
    if (data?.completed || current >= questions.length - 1) { navigate(ROUTES.INTERVIEW_COMPLETE); return }
    const next = current + 1
    setCurrent(next)
    setAnswer(answers.find((item) => item.questionId === questions[next]?.id)?.answer || '')
  }

  const previousQuestion = () => {
    const previous = current - 1
    if (previous < 0) return
    setCurrent(previous)
    setAnswer(answers.find((item) => item.questionId === questions[previous]?.id)?.answer || '')
  }

  const selectQuestion = (index) => {
    setCurrent(index)
    setAnswer(answers.find((item) => item.questionId === questions[index]?.id)?.answer || '')
    setShowQuestionList(false)
  }

  const endInterview = () => {
    timer.pause()
    navigate(ROUTES.INTERVIEW_COMPLETE)
  }

  return (
    <main className="interview-room">
      <header className="room-topbar">
        <button className="room-brand" type="button" onClick={() => setShowEnd(true)}>
          <span className="room-brand-mark"><AutoAwesomeRounded /></span>
          <span><strong>ApnaAcademy</strong><small>Interview AI</small></span>
        </button>
        <div className="room-top-center"><span className="live-pill"><span /> LIVE INTERVIEW</span><span className="room-role">{setup.role || 'AI Interview'}</span></div>
        <div className={'room-timer ' + (timer.remaining < 60 ? 'danger' : '')}><AccessTimeRounded /><strong>{timer.formatted}</strong><small>remaining</small></div>
      </header>

      <div className="room-progress-bar"><span style={{ width: progress + '%' }} /></div>

      <section className="room-main">
        <aside className={'room-sidebar ' + (showQuestionList ? 'mobile-open' : '')}>
          <div className="room-sidebar-head">
            <div><span>INTERVIEW PLAN</span><strong>{answeredCount}/{questions.length} answered</strong></div>
            <button type="button" onClick={() => setShowQuestionList(!showQuestionList)} aria-label="Toggle question list"><MoreHorizRounded /></button>
          </div>
          <div className="room-progress-ring" style={{ '--room-progress': progress + '%' }}><div><strong>{progress}%</strong><small>progress</small></div></div>
          <div className="room-question-list">
            {questions.map((item, index) => {
              const answered = answers.some((a) => a.questionId === item.id && a.answer?.trim())
              return (
                <button type="button" key={item.id} className={(index === current ? 'active ' : '') + (answered ? 'answered' : '')} onClick={() => selectQuestion(index)}>
                  <span>{index + 1}</span><div><strong>{item.category}</strong><small>{answered ? 'Answered' : 'Not answered'}</small></div>{answered ? <CheckCircleRounded /> : null}
                </button>
              )
            })}
          </div>
        </aside>

        <section className="room-workspace">
          <div className="room-ai-card">
            <div className="ai-avatar"><AutoAwesomeRounded /></div>
            <div className="ai-copy"><div><strong>AI Interviewer</strong><span className="ai-speaking"><span /><span /><span /> listening</span></div><p>Take your time. I'm listening to your answer.</p></div>
            <button type="button" className="icon-room-btn" aria-label="AI interviewer volume"><VolumeUpRounded /></button>
          </div>

          <div className="question-card">
            <div className="question-meta"><span>QUESTION {String(current + 1).padStart(2, '0')}</span><span>{question?.category}</span></div>
            <h1>{question?.question}</h1>
            <div className="question-hint"><ChatRounded /><div><strong>Think about</strong><span>{question?.hint}</span></div></div>
          </div>

          <div className="answer-card">
            <div className="answer-head">
              <div><span>Your response</span><small>Text fallback is available while voice mode is being connected.</small></div>
              <span className={'answer-status ' + (answer.trim() ? 'has-answer' : '')}>{answer.trim() ? 'Draft ready' : isAnswered ? 'Previously answered' : 'Waiting for answer'}</span>
            </div>
            <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Type your answer here, or use your microphone when voice mode is available…" maxLength={5000} />
            <div className="answer-toolbar">
              <span>{answer.length}/5000</span>
              <div>
                <button type="button" className={'room-control mic ' + (microphone === 'granted' ? 'on' : '')} onClick={toggleMicrophone} title="Toggle microphone">{microphone === 'granted' ? <MicRounded /> : <MicOffRounded />}</button>
                <button type="button" className="voice-answer-btn" onClick={toggleMicrophone}><KeyboardVoiceRounded /> {microphone === 'granted' ? 'Mute mic' : 'Enable mic'}</button>
                <button type="button" className="submit-answer-btn" onClick={saveAnswer} disabled={!answer.trim() || submitting}>{submitting ? 'Saving…' : 'Save answer'} <SendRounded /></button>
              </div>
            </div>
          </div>

          <div className="room-navigation">
            <button type="button" className="room-nav-secondary" disabled={current === 0} onClick={previousQuestion}><ChevronLeftRounded /> Previous</button>
            <div className="room-nav-center"><span>{current + 1} of {questions.length}</span><button type="button" onClick={() => setShowQuestionList(!showQuestionList)}>Questions</button></div>
            <button type="button" className="room-nav-primary" onClick={nextQuestion}>{current === questions.length - 1 ? 'Finish interview' : 'Next question'} <ChevronRightRounded /></button>
          </div>
        </section>

        <aside className="room-camera-panel">
          <div className="camera-heading"><span>Your camera</span><button type="button" aria-label="Camera details"><ExpandRounded /></button></div>
          <div className="camera-preview">
            {camera === 'granted' ? <video ref={videoRef} autoPlay muted playsInline /> : <div className="camera-off"><VideocamOffRounded /><span>Camera is off</span><button type="button" onClick={() => requestMedia()}>Turn on</button></div>}
            <span className="camera-live"><span /> You</span>
            <div className="camera-controls"><button type="button" onClick={toggleMicrophone} className={microphone === 'granted' ? '' : 'off'}>{microphone === 'granted' ? <MicRounded /> : <MicOffRounded />}</button><button type="button" onClick={toggleCamera} className={camera === 'granted' ? '' : 'off'}>{camera === 'granted' ? <VideocamRounded /> : <VideocamOffRounded />}</button></div>
          </div>
          <div className="camera-note"><CheckCircleRounded /> Camera preview stays on this device.</div>
          <button type="button" className="pause-btn" onClick={() => setPaused(!paused)}>{paused ? <PlayArrowRounded /> : <PauseRounded />}{paused ? 'Resume interview' : 'Pause interview'}</button>
          <button type="button" className="end-btn" onClick={() => setShowEnd(true)}><StopCircleRounded /> End interview</button>
        </aside>
      </section>

      {paused ? <div className="pause-overlay"><div className="pause-modal"><span className="pause-modal-icon"><PauseRounded /></span><h2>Interview paused</h2><p>Your timer is paused. Resume when you're ready to continue.</p><button type="button" className="gradient-btn" onClick={() => setPaused(false)}><PlayArrowRounded /> Resume interview</button></div></div> : null}

      {showEnd ? <div className="end-overlay" role="dialog" aria-modal="true" aria-labelledby="end-title"><div className="end-modal"><button className="end-close" type="button" onClick={() => setShowEnd(false)} aria-label="Close"><CloseRounded /></button><span className="warning-icon"><WarningAmberRounded /></span><h2 id="end-title">End this interview?</h2><p>Your saved answers will remain in this session, but you won't be able to continue after ending the interview.</p><div><button type="button" className="cancel-end" onClick={() => setShowEnd(false)}>Keep practicing</button><button type="button" className="confirm-end" onClick={endInterview}>End interview</button></div></div></div> : null}

      <button className="room-mobile-back" type="button" onClick={() => setShowEnd(true)} aria-label="Exit interview"><ArrowBackRounded /></button>
    </main>
  )
}
