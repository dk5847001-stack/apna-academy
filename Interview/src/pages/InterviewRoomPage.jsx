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
import CosmicField from '../components/common/CosmicField'

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
    if (voiceEnabled) return
    voiceTurnIdRef.current += 1
    autoVoiceTurnRef.current = false
    voice.stopSpeaking()
    voice.stopListening()
    conversation.reset()
  }, [voiceEnabled, voice.stopSpeaking, voice.stopListening, conversation.reset])

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

      return (
    <main className="interview-room cosmic-room room-simple">
      <CosmicField density="room" />

      <div className="room-ref-sessionbar">
        <div className="room-ref-session-title">
          <span className="room-ref-live-dot" />
          <div><strong>AI Interview in progress</strong><small>Stay natural — your answers are saved automatically.</small></div>
        </div>
        <div className="room-ref-progress">
          <span>Question {current + 1} of {questions.length}</span>
          <div><i style={{ width: progress + '%' }} /></div>
          <small>{answeredCount} answered</small>
        </div>
        <div className="room-ref-time"><AccessTimeRounded /><strong>{timer.formatted}</strong><small>left</small></div>
      </div>

      {roomError ? (
        <div className="room-simple-error" role="alert">
          <WarningAmberRounded />
          <span>{roomError}</span>
          <button type="button" onClick={() => setRoomError('')}>Dismiss</button>
        </div>
      ) : null}

      <section className="room-simple-content">
        <div className="room-simple-step">
          <span className="room-simple-step-number">01</span>
          <div>
            <strong>Listen to the question</strong>
            <small>The AI interviewer will ask you a question. Read it below or listen to the voice.</small>
          </div>
          <button
            type="button"
            className={'room-simple-voice-toggle ' + (voiceEnabled ? 'on' : '')}
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
          >
            <VolumeUpRounded />
            {voiceEnabled ? 'Voice on' : 'Voice off'}
          </button>
        </div>

        <article className="room-simple-question">
          <div className="room-simple-question-top">
            <span>{question?.category || 'Interview question'}</span>
            <b>{String(current + 1).padStart(2, '0')}</b>
          </div>
          <h1>{question?.question || 'Loading your interview question…'}</h1>
          {question?.hint ? (
            <div className="room-simple-hint">
              <ChatRounded />
              <div><strong>Need a starting point?</strong><span>{question.hint}</span></div>
            </div>
          ) : null}
          <div className="room-simple-ai-status">
            <span className={'room-simple-status-dot ' + conversation.status} />
            <strong>AI Interviewer</strong>
            <span>{conversation.label}</span>
          </div>
        </article>

        <div className="room-simple-step room-simple-step-answer">
          <span className="room-simple-step-number">02</span>
          <div>
            <strong>Give your answer</strong>
            <small>There is no perfect answer. Explain your thinking clearly and use an example when you can.</small>
          </div>
        </div>

        {aiConversationMessage && evaluationQuestionId === question?.id ? (
          <div className="room-simple-feedback room-simple-ai-message" role="status" aria-live="polite">
            <div><AutoAwesomeRounded /><strong>AI feedback</strong></div>
            <p>{aiConversationMessage}</p>
          </div>
        ) : null}

        {lastEvaluation && evaluationQuestionId === question?.id ? (
          <div className="room-simple-feedback" role="status">
            <div className="room-simple-feedback-head">
              <div><strong>Your answer was reviewed</strong><span>{lastEvaluation.feedback || 'Evaluation completed.'}</span></div>
              <b>{Math.round(Number(lastEvaluation.score) || 0)}<small>/100</small></b>
            </div>
            <div className="room-simple-feedback-grid">
              <div><strong>What went well</strong>{(lastEvaluation.strengths || []).slice(0, 2).map((item) => <span key={item}>✓ {item}</span>)}</div>
              <div><strong>Try next time</strong>{(lastEvaluation.improvements || []).slice(0, 2).map((item) => <span key={item}>→ {item}</span>)}</div>
            </div>
          </div>
        ) : null}

        <div className="room-simple-answer">
          <div className="room-simple-answer-head">
            <div>
              <strong>Your answer</strong>
              <span>{voice.supported ? 'Type your answer or use the microphone.' : 'Type your answer below.'}</span>
            </div>
            <span>{answer.length}/5000</span>
          </div>

          <textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder={voice.supported ? 'Start typing your answer here…' : 'Type your answer here…'}
            maxLength={5000}
          />

          {voice.interimTranscript ? (
            <div className="room-simple-listening"><KeyboardVoiceRounded /> Listening: <span>{voice.interimTranscript}</span></div>
          ) : null}
          {voice.listening ? (
            <div className="room-simple-listening-hint">Keep speaking. Your voice answer will be submitted after a short pause.</div>
          ) : null}
          {voice.voiceError ? <div className="room-simple-voice-error">{voice.voiceError}</div> : null}

          <div className="room-simple-answer-actions">
            <button
              type="button"
              className={'room-simple-mic ' + (microphone === 'granted' ? 'active' : '')}
              onClick={() => {
                toggleMicrophone()
                if (voice.listening) voice.stopListening()
                else voice.startListening()
              }}
              title="Toggle microphone"
            >
              {microphone === 'granted' ? <MicRounded /> : <MicOffRounded />}
            </button>

            <button
              type="button"
              className={'room-simple-speak ' + (voice.listening ? 'active' : '')}
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
            >
              <KeyboardVoiceRounded />
              {voice.listening ? 'Stop listening' : 'Answer by voice'}
            </button>

            <button
              type="button"
              className="room-simple-save"
              onClick={saveAnswer}
              disabled={!answer.trim() || submitting}
            >
              {submitting ? 'Saving answer…' : 'Save answer'}
              <SendRounded />
            </button>
          </div>
        </div>

        <div className="room-simple-navigation">
          <button type="button" disabled={current === 0 || submitting} onClick={previousQuestion}>
            <ChevronLeftRounded /> Previous
          </button>
          <span>Step {current + 1} / {questions.length}</span>
          <button type="button" onClick={nextQuestion} disabled={submitting}>
            {interviewCompleted || session?.status === 'completed'
              ? 'View results'
              : current === questions.length - 1
                ? 'Finish interview'
                : 'Next question'}
            <ChevronRightRounded />
          </button>
        </div>

        <div className="room-simple-tools">
          <div className="room-simple-camera">
            <div className="room-simple-camera-head">
              <div><strong>Your camera</strong><span>Only you can see this preview.</span></div>
              <span className={camera === 'granted' ? 'ready' : ''}>{camera === 'granted' ? 'Ready' : 'Off'}</span>
            </div>
            <div className="room-simple-camera-preview">
              {camera === 'granted'
                ? <video ref={videoRef} autoPlay muted playsInline />
                : <div><VideocamOffRounded /><span>Camera is off</span><button type="button" onClick={() => requestMedia()}>Turn on camera</button></div>}
              <div className="room-simple-camera-controls">
                <button type="button" onClick={toggleMicrophone}>{microphone === 'granted' ? <MicRounded /> : <MicOffRounded />}</button>
                <button type="button" onClick={toggleCamera}>{camera === 'granted' ? <VideocamRounded /> : <VideocamOffRounded />}</button>
              </div>
            </div>
          </div>

          <div className="room-simple-session-card">
            <strong>Take your time</strong>
            <p>You can pause the interview whenever you need a short break. Your saved answers stay in this session.</p>
            <button type="button" onClick={() => setPaused(!paused)}>
              {paused ? <PlayArrowRounded /> : <PauseRounded />}
              {paused ? 'Resume interview' : 'Pause interview'}
            </button>
            <button type="button" className="danger" onClick={() => setShowEnd(true)}>
              <StopCircleRounded /> End interview
            </button>
          </div>
        </div>
      </section>

      {paused ? (
        <div className="room-simple-overlay">
          <div className="room-simple-modal">
            <span><PauseRounded /></span>
            <h2>Interview paused</h2>
            <p>Your timer is paused. Continue when you are ready.</p>
            <button type="button" onClick={() => setPaused(false)}><PlayArrowRounded /> Resume interview</button>
          </div>
        </div>
      ) : null}

      {showEnd ? (
        <div className="room-simple-overlay" role="dialog" aria-modal="true" aria-labelledby="end-title">
          <div className="room-simple-modal">
            <button className="room-simple-close" type="button" onClick={() => setShowEnd(false)} aria-label="Close"><CloseRounded /></button>
            <span className="warning"><WarningAmberRounded /></span>
            <h2 id="end-title">End this interview?</h2>
            <p>Your saved answers will stay in this session. You can review your progress before leaving.</p>
            <div className="room-simple-modal-actions">
              <button type="button" onClick={() => setShowEnd(false)}>Continue interview</button>
              <button type="button" className="danger" onClick={endInterview}>End interview</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
