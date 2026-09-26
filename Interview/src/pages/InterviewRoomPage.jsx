import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { useInterviewConversation } from '../hooks/useInterviewConversation'
import { CONVERSATION_STATES } from '../conversation/conversationState'
import { VOICE_RESPONSE_ACTIONS, resolveVoiceResponseAction } from '../voice/voiceResponseFlow'
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
  const [aiConversationMessage, setAiConversationMessage] = useState('')
  const [evaluationQuestionId, setEvaluationQuestionId] = useState('')
  const [interviewCompleted, setInterviewCompleted] = useState(false)
  const videoRef = useRef(null)
  const finalizingRef = useRef(false)
  const autoVoiceTurnRef = useRef(false)
  const answerRef = useRef(answer)
  const questionRef = useRef(null)
  const answersRef = useRef(answers)
  const pausedRef = useRef(paused)
  const voiceEnabledRef = useRef(voiceEnabled)
  const interviewCompletedRef = useRef(interviewCompleted)
  const sessionStatusRef = useRef(session?.status)
  const submittingRef = useRef(submitting)
  const microphoneRef = useRef(microphone)
  const saveAnswerRef = useRef(null)
  const autoListenQuestionIdRef = useRef('')
  const voiceTurnIdRef = useRef(0)
  const timer = useInterviewTimer(Math.max(60, Number(setup.durationMinutes || 30) * 60), true)
  const voice = useInterviewVoice({
    onTranscript: (text) => setAnswer((currentAnswer) => (currentAnswer ? currentAnswer + ' ' : '') + text),
    onSilence: () => {
      if (!autoVoiceTurnRef.current || pausedRef.current || interviewCompletedRef.current || sessionStatusRef.current === 'completed') return
      autoVoiceTurnRef.current = false
      saveAnswerRef.current?.()
    },
  })
  const conversation = useInterviewConversation()
  const question = questions[current] || questions[0]

  answerRef.current = answer
  questionRef.current = question
  answersRef.current = answers
  pausedRef.current = paused
  voiceEnabledRef.current = voiceEnabled
  interviewCompletedRef.current = interviewCompleted
  sessionStatusRef.current = session?.status
  submittingRef.current = submitting
  microphoneRef.current = microphone

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
      conversation.complete()
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
    if (paused) {
      timer.pause()
      autoVoiceTurnRef.current = false
      voice.stopListening()
      voice.stopSpeaking()
      conversation.pause()
      return
    }
    if (conversation.isPaused) conversation.resume(CONVERSATION_STATES.IDLE)
  }, [paused, timer, voice.stopListening, voice.stopSpeaking, conversation.isPaused, conversation.pause, conversation.resume])

  const startVoiceCapture = useCallback(() => {
    const currentQuestion = questionRef.current
    const currentAnswers = answersRef.current
    if (
      !voiceEnabledRef.current ||
      pausedRef.current ||
      submittingRef.current ||
      interviewCompletedRef.current ||
      sessionStatusRef.current === 'completed' ||
      !currentQuestion?.id ||
      answerRef.current.trim()
    ) return false

    const alreadyAnswered = currentAnswers.some(
      (item) => item.questionId === currentQuestion.id && item.answer?.trim()
    )
    if (alreadyAnswered || autoVoiceTurnRef.current) return false
    if (microphoneRef.current === 'denied' || microphoneRef.current === 'unsupported') return false

    autoVoiceTurnRef.current = true
    return voice.startListening()
  }, [voice.startListening])

  useEffect(() => {
    if (!voiceEnabled || !question?.question || paused) return

    if (autoListenQuestionIdRef.current === question.id) {
      autoListenQuestionIdRef.current = ''
      conversation.reset()
      const listenTimer = window.setTimeout(() => {
        if (!pausedRef.current && !interviewCompletedRef.current && sessionStatusRef.current !== 'completed') {
          startVoiceCapture()
        }
      }, 0)

      return () => {
        window.clearTimeout(listenTimer)
        voice.stopSpeaking()
        autoVoiceTurnRef.current = false
        voice.stopListening()
      }
    }

    const speechTurnId = voiceTurnIdRef.current + 1
    voiceTurnIdRef.current = speechTurnId
    conversation.startAiSpeaking()

    const handleSpeechEnd = () => {
      if (speechTurnId !== voiceTurnIdRef.current) return
      conversation.aiSpeechEnded()
      startVoiceCapture()
    }

    const handleSpeechError = () => {
      if (speechTurnId !== voiceTurnIdRef.current) return
      conversation.setError('AI voice playback failed. You can continue in text mode.')
      conversation.aiSpeechEnded()
      startVoiceCapture()
    }

    const spoken = voice.speak(question.question, {
      onEnd: handleSpeechEnd,
      onError: handleSpeechError,
    })

    if (!spoken) {
      conversation.aiSpeechEnded()
      startVoiceCapture()
    }

    return () => {
      voiceTurnIdRef.current += 1
      voice.stopSpeaking()
      autoVoiceTurnRef.current = false
      voice.stopListening()
      conversation.aiSpeechEnded()
    }
  }, [current, paused, question?.id, question?.question, voiceEnabled, voice.speak, voice.stopSpeaking, voice.stopListening, startVoiceCapture, conversation.reset, conversation.startAiSpeaking, conversation.aiSpeechEnded, conversation.setError])

  useEffect(() => {
    if (voice.listening) conversation.startListening()
    else if (conversation.isListening) conversation.stopListening()
  }, [voice.listening, conversation.isListening, conversation.startListening, conversation.stopListening])

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
    autoVoiceTurnRef.current = false
    voice.stopListening()
    conversation.startProcessing()
    try {
      if (!session?.id || String(session.id).startsWith('mock-')) throw new Error('Your AI session is not available. Please restart the interview.')
      const cleanAnswer = answer.trim()
      const data = await interviewApi.submitInterviewAnswer({ sessionId: session.id, questionId: question.id, answer: cleanAnswer })
      const saved = { questionId: question.id, answer: cleanAnswer, score: data.evaluation?.score, feedback: data.evaluation?.feedback, strengths: data.evaluation?.strengths, improvements: data.evaluation?.improvements, answeredAt: new Date().toISOString() }
      const nextAnswers = answers.filter((item) => item.questionId !== question.id).concat(saved)
      setLastEvaluation(data.evaluation || null)
      setAiConversationMessage(String(data.aiResponse?.message || data.evaluation?.spokenResponse || '').trim())
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

      const responseMessage = String(data.aiResponse?.message || data.evaluation?.spokenResponse || '').trim()
      const nextQuestionId = data.nextQuestion?.id || ''
      const nextIndex = nextQuestionId
        ? (data.questions || questions).findIndex((item) => item.id === nextQuestionId)
        : -1

      const advanceAfterResponse = () => {
        const next = nextIndex >= 0 ? (data.questions || questions)[nextIndex] : null
        const action = resolveVoiceResponseAction({
          completed: Boolean(data.completed),
          nextQuestionId: next?.id || '',
          nextQuestionIsFollowUp: Boolean(next?.isFollowUp),
        })

        if (action === VOICE_RESPONSE_ACTIONS.COMPLETE) {
          conversation.complete()
          navigate(ROUTES.INTERVIEW_COMPLETE)
          return
        }

        if (action === VOICE_RESPONSE_ACTIONS.WAIT) {
          conversation.aiResponseEnded()
          return
        }

        setLastEvaluation(null)
        setAiConversationMessage('')
        setEvaluationQuestionId('')
        setAnswer('')

        if (action === VOICE_RESPONSE_ACTIONS.LISTEN_FOLLOW_UP) {
          autoListenQuestionIdRef.current = next.id
        }

        conversation.aiResponseEnded()
        setCurrent(nextIndex)
      }

      if (!responseMessage) {
        advanceAfterResponse()
      } else {
        const responseTurnId = voiceTurnIdRef.current + 1
        voiceTurnIdRef.current = responseTurnId
        voice.stopListening()
        autoVoiceTurnRef.current = false
        conversation.startAiResponding()

        const spokenResponse = voice.speak(responseMessage, {
          onEnd: () => {
            if (responseTurnId !== voiceTurnIdRef.current) return
            advanceAfterResponse()
          },
          onError: () => {
            if (responseTurnId !== voiceTurnIdRef.current) return
            conversation.setError('AI feedback voice playback failed. Continuing the interview.')
            advanceAfterResponse()
          },
        })

        if (!spokenResponse) {
          advanceAfterResponse()
        }
      }

      return data
    } catch (error) {
      const message = error?.message || 'We could not save your answer. Please try again.'
      setRoomError(message)
      conversation.setError(message)
      return null
    } finally { setSubmitting(false) }
  }

  saveAnswerRef.current = saveAnswer

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

    voiceTurnIdRef.current += 1
    voice.stopSpeaking()
    autoListenQuestionIdRef.current = ''
    setLastEvaluation(null)
    setAiConversationMessage('')
    setEvaluationQuestionId('')
    setCurrent(nextIndex)
    setAnswer(answers.find((item) => item.questionId === nextId)?.answer || '')
  }

  const previousQuestion = () => {
    voiceTurnIdRef.current += 1
    autoListenQuestionIdRef.current = ''
    autoVoiceTurnRef.current = false
    voice.stopListening()
    voice.stopSpeaking()
    const previous = current - 1
    if (previous < 0) return
    setLastEvaluation(null)
    setAiConversationMessage('')
    setEvaluationQuestionId('')
    setCurrent(previous)
    setAnswer(answers.find((item) => item.questionId === questions[previous]?.id)?.answer || '')
  }

  const selectQuestion = (index) => {
    voiceTurnIdRef.current += 1
    autoListenQuestionIdRef.current = ''
    autoVoiceTurnRef.current = false
    voice.stopListening()
    voice.stopSpeaking()
    setLastEvaluation(null)
    setAiConversationMessage('')
    setEvaluationQuestionId('')
    setCurrent(index)
    setAnswer(answers.find((item) => item.questionId === questions[index]?.id)?.answer || '')
    setShowQuestionList(false)
  }

  const endInterview = async () => {
    timer.pause()
    voiceTurnIdRef.current += 1
    autoListenQuestionIdRef.current = ''
    autoVoiceTurnRef.current = false
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
            <div className="ai-copy"><div><strong>AI Interviewer</strong><span className={'ai-speaking ai-conversation-state ' + conversation.status}><span /><span /><span /> {conversation.label}</span></div><p>{conversation.status === CONVERSATION_STATES.AI_SPEAKING ? 'Listen to the question, then answer naturally.' : conversation.status === CONVERSATION_STATES.PROCESSING ? 'I am reviewing your answer.' : conversation.status === CONVERSATION_STATES.AI_RESPONDING ? 'Listen to my feedback and follow-up.' : 'Take your time. I am ready for your answer.'}</p></div>
            <button
              type="button"
              className={"icon-room-btn " + (voice.speaking ? "active" : "")}
              aria-label={voiceEnabled ? "Turn off AI interviewer voice" : "Turn on AI interviewer voice"}
              onClick={() => {
                voiceTurnIdRef.current += 1
                setVoiceEnabled((value) => !value)
                voice.stopSpeaking()
                if (voiceEnabledRef.current) {
                  autoVoiceTurnRef.current = false
                  voice.stopListening()
                  conversation.reset()
                }
              }}
            ><VolumeUpRounded /></button>
          </div>

          <div className="question-card">
            <div className="question-meta"><span>QUESTION {String(current + 1).padStart(2, '0')}</span><span>{question?.category}</span></div>
            <h1>{question?.question}</h1>
            <div className="question-hint"><ChatRounded /><div><strong>Think about</strong><span>{question?.hint}</span></div></div>
          </div>

          {aiConversationMessage && evaluationQuestionId === question?.id ? (
            <div className="ai-conversation-message" role="status" aria-live="polite">
              <div className="ai-conversation-message-head">
                <span className="ai-avatar-mini"><AutoAwesomeRounded /></span>
                <div><strong>AI Interviewer</strong><small>Conversational feedback</small></div>
              </div>
              <p>{aiConversationMessage}</p>
            </div>
          ) : null}

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
            {voice.listening ? <div className="voice-auto-hint">Voice answer will submit automatically after {Math.round(voice.silenceTimeoutMs / 100) / 10}s of silence.</div> : null}
            {voice.voiceError ? <div className="voice-error">{voice.voiceError}</div> : null}
            <div className="answer-toolbar">
              <span>{answer.length}/5000</span>
              <div>
                <button type="button" className={'room-control mic ' + (microphone === 'granted' ? 'on' : '')} onClick={() => { toggleMicrophone(); if (voice.listening) voice.stopListening(); else voice.startListening() }} title="Toggle microphone">{microphone === 'granted' ? <MicRounded /> : <MicOffRounded />}</button>
                <button
                  type="button"
                  className={"voice-answer-btn " + (voice.listening ? "active" : "")}
                  disabled={submitting || !voice.supported || conversation.isAiSpeaking || paused}
                  onClick={async () => {
                    if (voice.listening) {
                      autoVoiceTurnRef.current = false
                      voice.stopListening()
                      return
                    }
                    if (microphone !== 'granted') {
                      const stream = await requestMedia()
                      if (!stream) return
                    }
                    autoVoiceTurnRef.current = true
                    voice.startListening()
                  }}
                ><KeyboardVoiceRounded /> {voice.listening ? "Stop listening" : "Answer by voice"}</button>
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
