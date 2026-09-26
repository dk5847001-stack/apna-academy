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
import { useInterviewVoice } from '../hooks/useInterviewVoice'
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
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [roomError, setRoomError] = useState('')
  const [lastEvaluation, setLastEvaluation] = useState(null)
  const [evaluationQuestionId, setEvaluationQuestionId] = useState('')
  const [interviewCompleted, setInterviewCompleted] = useState(false)
  const videoRef = useRef(null)
  const finalizingRef = useRef(false)
  const timer = useInterviewTimer(Math.max(60, Number(setup.durationMinutes || 30) * 60), true)
  const voice = useInterviewVoice({ onTranscript: (text) => setAnswer((currentAnswer) => (currentAnswer ? currentAnswer + ' ' : '') + text) })
  const question = questions[current] || questions[0]

  useEffect(() => {
    requestMedia().then((stream) => {
      if (stream && videoRef.current) videoRef.current.srcObject = stream
    })
  }, [requestMedia])

  useEffect(() => {
    if (streamRef.current && videoRef.current) videoRef.current.srcObject = streamRef.current
  }, [camera, microphone, streamRef])

  const finalizeSession = async () => {
    if (finalizingRef.current) return
    finalizingRef.current = true

    if (!session?.id || String(session.id).startsWith('mock-')) {
      navigate(ROUTES.INTERVIEW_COMPLETE)
      return
    }

    try {
      const data = await interviewApi.completeInterview(session.id)
      setSession((value) => ({ ...(value || {}), result: data.result || null, status: data.status || 'completed' }))
    } catch (error) {
      if (error?.code === 'INTERVIEW_NOT_FOUND') {
        setRoomError('This interview session is no longer active. Please start a new interview.')
      } else {
        setRoomError(error?.message || 'We could not finalize the interview. Your saved answers remain on the server.')
      }
    } finally {
      navigate(ROUTES.INTERVIEW_COMPLETE)
    }
  }

  useEffect(() => {
    if (timer.remaining === 0) finalizeSession()
  }, [timer.remaining])

  useEffect(() => {
    if (paused) { timer.pause(); voice.stopListening(); voice.stopSpeaking() }
  }, [paused, timer, voice.stopListening, voice.stopSpeaking])

  useEffect(() => {
    if (!voiceEnabled || !question?.question || paused) return
    voice.speak(question.question)
    return () => voice.stopSpeaking()
  }, [current, voiceEnabled, paused, question?.question, voice.speak, voice.stopSpeaking])

  useEffect(() => {
    setSession((value) => ({ ...(value || {}), currentQuestion: current, answers }))
  }, [current, answers, setSession])

  const answeredCount = answers.filter((item) => item?.answer?.trim()).length
  const progress = Math.round(((current + 1) / questions.length) * 100)
  const isAnswered = answers.some((item) => item.questionId === question?.id && item.answer?.trim())

  const saveAnswer = async () => {
    if (!question || !answer.trim() || submitting) return null
    setSubmitting(true)
    setRoomError('')
    try {
      if (!session?.id || String(session.id).startsWith('mock-')) throw new Error('Your AI session is not available. Please restart the interview.')
      const cleanAnswer = answer.trim()
      const data = await interviewApi.submitInterviewAnswer({ sessionId: session.id, questionId: question.id, answer: cleanAnswer })
      const saved = { questionId: question.id, answer: cleanAnswer, score: data.evaluation?.score, feedback: data.evaluation?.feedback, strengths: data.evaluation?.strengths, improvements: data.evaluation?.improvements, answeredAt: new Date().toISOString() }
      const nextAnswers = answers.filter((item) => item.questionId !== question.id).concat(saved)
      setLastEvaluation(data.evaluation || null)
      setEvaluationQuestionId(question.id)
      setInterviewCompleted(Boolean(data.completed))
      setAnswers(nextAnswers)
      setSession((value) => ({
        ...(value || {}),
        answers: nextAnswers,
        questions: data.questions || value?.questions,
        result: data.result || value?.result,
        status: data.completed ? 'completed' : 'in-progress',
      }))
      setAnswer('')
      return data
    } catch (error) {
      setRoomError(error?.message || 'We could not save your answer. Please try again.')
      return null
    } finally { setSubmitting(false) }
  }

  const nextQuestion = async () => {
    if (interviewCompleted || session?.status === 'completed') {
      navigate(ROUTES.INTERVIEW_COMPLETE)
      return
    }

    const hadDraft = Boolean(answer.trim())
    const data = hadDraft ? await saveAnswer() : null
    if (hadDraft && !data) return
    if (data?.completed) {
      navigate(ROUTES.INTERVIEW_COMPLETE)
      return
    }

    const responseQuestions = Array.isArray(data?.questions) ? data.questions : questions
    const effectiveAnswers = hadDraft
      ? answers.concat({ questionId: question?.id, answer: 'saved' })
      : answers
    const nextId = data?.nextQuestion?.id || responseQuestions
      .slice(current + 1)
      .find((item) => !effectiveAnswers.some((saved) => saved.questionId === item.id && saved.answer?.trim()))?.id
      || responseQuestions.find((item) => !effectiveAnswers.some((saved) => saved.questionId === item.id && saved.answer?.trim()))?.id

    const nextIndex = responseQuestions.findIndex((item) => item.id === nextId)

    if (nextIndex < 0) {
      await finalizeSession()
      return
    }

    setLastEvaluation(null)
    setEvaluationQuestionId('')
    setCurrent(nextIndex)
    setAnswer(answers.find((item) => item.questionId === nextId)?.answer || '')
  }

  const previousQuestion = () => {
    const previous = current - 1
    if (previous < 0) return
    setLastEvaluation(null)
    setEvaluationQuestionId('')
    setCurrent(previous)
    setAnswer(answers.find((item) => item.questionId === questions[previous]?.id)?.answer || '')
  }

  const selectQuestion = (index) => {
    setLastEvaluation(null)
    setEvaluationQuestionId('')
    setCurrent(index)
    setAnswer(answers.find((item) => item.questionId === questions[index]?.id)?.answer || '')
    setShowQuestionList(false)
  }

  const endInterview = async () => {
    timer.pause()
    voice.stopListening()
    voice.stopSpeaking()
    await finalizeSession()
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
      {roomError ? <div className="room-inline-error" role="alert"><WarningAmberRounded /> <span>{roomError}</span><button type="button" onClick={() => setRoomError('')}>Dismiss</button></div> : null}

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
            <button type="button" className={"icon-room-btn " + (voice.speaking ? "active" : "")} aria-label="Toggle AI interviewer voice" onClick={() => { setVoiceEnabled((value) => !value); if (voice.speaking) voice.stopSpeaking(); else voice.speak(question?.question) }}><VolumeUpRounded /></button>
          </div>

          <div className="question-card">
            <div className="question-meta"><span>QUESTION {String(current + 1).padStart(2, '0')}</span><span>{question?.category}</span></div>
            <h1>{question?.question}</h1>
            <div className="question-hint"><ChatRounded /><div><strong>Think about</strong><span>{question?.hint}</span></div></div>
          </div>

          {lastEvaluation && evaluationQuestionId === question?.id ? (
            <div className="answer-feedback-card" role="status">
              <div className="answer-feedback-head">
                <div>
                  <span>AI ANSWER FEEDBACK</span>
                  <strong>{Number(lastEvaluation.score) >= 70 ? 'Strong answer' : Number(lastEvaluation.score) >= 50 ? 'Partially correct' : 'Needs improvement'}</strong>
                </div>
                <div className="answer-feedback-score">{Math.round(Number(lastEvaluation.score) || 0)}<small>/100</small></div>
              </div>
              <p>{lastEvaluation.feedback || 'Your answer was evaluated successfully.'}</p>
              <div className="answer-feedback-grid">
                <div><b>Strengths</b>{(lastEvaluation.strengths || []).slice(0, 3).map((item) => <span key={item}>✓ {item}</span>)}</div>
                <div><b>Improve</b>{(lastEvaluation.improvements || []).slice(0, 3).map((item) => <span key={item}>→ {item}</span>)}</div>
              </div>
            </div>
          ) : null}

          <div className="answer-card">
            <div className="answer-head">
              <div><span>Your response</span><small>{voice.supported ? "Speak naturally or type your answer." : "Voice input is not supported in this browser; text input is available."}</small></div>
              <span className={'answer-status ' + (answer.trim() ? 'has-answer' : '')}>{answer.trim() ? 'Draft ready' : isAnswered ? 'Previously answered' : 'Waiting for answer'}</span>
            </div>
            <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder={voice.supported ? "Speak your answer or type it here…" : "Type your answer here…"} maxLength={5000} />
            {voice.interimTranscript ? <div className="voice-live-transcript"><KeyboardVoiceRounded /> Listening: <span>{voice.interimTranscript}</span></div> : null}
            {voice.voiceError ? <div className="voice-error">{voice.voiceError}</div> : null}
            <div className="answer-toolbar">
              <span>{answer.length}/5000</span>
              <div>
                <button type="button" className={'room-control mic ' + (microphone === 'granted' ? 'on' : '')} onClick={() => { toggleMicrophone(); if (voice.listening) voice.stopListening(); else voice.startListening() }} title="Toggle microphone">{microphone === 'granted' ? <MicRounded /> : <MicOffRounded />}</button>
                <button type="button" className={"voice-answer-btn " + (voice.listening ? "active" : "")} onClick={() => { if (microphone !== "granted") requestMedia(); voice.toggleListening() }}><KeyboardVoiceRounded /> {voice.listening ? "Stop speaking" : "Answer by voice"}</button>
                <button type="button" className="submit-answer-btn" onClick={saveAnswer} disabled={!answer.trim() || submitting}>{submitting ? 'Saving…' : 'Save answer'} <SendRounded /></button>
              </div>
            </div>
          </div>

          <div className="room-navigation">
            <button type="button" className="room-nav-secondary" disabled={current === 0} onClick={previousQuestion}><ChevronLeftRounded /> Previous</button>
            <div className="room-nav-center"><span>{current + 1} of {questions.length}</span><button type="button" onClick={() => setShowQuestionList(!showQuestionList)}>Questions</button></div>
            <button type="button" className="room-nav-primary" onClick={nextQuestion}>{interviewCompleted || session?.status === 'completed' ? 'View results' : current === questions.length - 1 ? 'Finish interview' : 'Next question'} <ChevronRightRounded /></button>
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
