import { useCallback, useReducer } from 'react'
import {
  CONVERSATION_EVENTS,
  CONVERSATION_STATES,
  conversationReducer,
  initialConversationState,
} from '../conversation/conversationState'

const STATUS_LABELS = Object.freeze({
  [CONVERSATION_STATES.IDLE]: 'Your turn',
  [CONVERSATION_STATES.AI_SPEAKING]: 'AI is speaking',
  [CONVERSATION_STATES.LISTENING]: 'Listening',
  [CONVERSATION_STATES.PROCESSING]: 'AI is thinking',
  [CONVERSATION_STATES.AI_RESPONDING]: 'AI is responding',
  [CONVERSATION_STATES.PAUSED]: 'Interview paused',
  [CONVERSATION_STATES.COMPLETED]: 'Interview complete',
  [CONVERSATION_STATES.ERROR]: 'Conversation error',
})

export function useInterviewConversation() {
  const [conversation, dispatch] = useReducer(conversationReducer, initialConversationState)

  const startAiSpeaking = useCallback(() => {
    dispatch({ type: CONVERSATION_EVENTS.START_AI_SPEAKING })
  }, [])

  const aiSpeechEnded = useCallback(() => {
    dispatch({ type: CONVERSATION_EVENTS.AI_SPEECH_ENDED })
  }, [])

  const startListening = useCallback(() => {
    dispatch({ type: CONVERSATION_EVENTS.START_LISTENING })
  }, [])

  const stopListening = useCallback(() => {
    dispatch({ type: CONVERSATION_EVENTS.STOP_LISTENING })
  }, [])

  const startProcessing = useCallback(() => {
    dispatch({ type: CONVERSATION_EVENTS.START_PROCESSING })
  }, [])

  const startAiResponding = useCallback(() => {
    dispatch({ type: CONVERSATION_EVENTS.START_AI_RESPONDING })
  }, [])

  const aiResponseEnded = useCallback(() => {
    dispatch({ type: CONVERSATION_EVENTS.AI_RESPONSE_ENDED })
  }, [])

  const pause = useCallback(() => {
    dispatch({ type: CONVERSATION_EVENTS.PAUSE })
  }, [])

  const resume = useCallback(() => {
    dispatch({ type: CONVERSATION_EVENTS.RESUME })
  }, [])

  const complete = useCallback(() => {
    dispatch({ type: CONVERSATION_EVENTS.COMPLETE })
  }, [])

  const setError = useCallback((message) => {
    dispatch({ type: CONVERSATION_EVENTS.ERROR, message })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: CONVERSATION_EVENTS.RESET })
  }, [])

  return {
    status: conversation.status,
    resumeTo: conversation.resumeTo,
    error: conversation.error,
    label: STATUS_LABELS[conversation.status] || STATUS_LABELS[CONVERSATION_STATES.ERROR],
    isAiSpeaking: conversation.status === CONVERSATION_STATES.AI_SPEAKING,
    isListening: conversation.status === CONVERSATION_STATES.LISTENING,
    isProcessing: conversation.status === CONVERSATION_STATES.PROCESSING,
    isAiResponding: conversation.status === CONVERSATION_STATES.AI_RESPONDING,
    isPaused: conversation.status === CONVERSATION_STATES.PAUSED,
    isCompleted: conversation.status === CONVERSATION_STATES.COMPLETED,
    startAiSpeaking,
    aiSpeechEnded,
    startListening,
    stopListening,
    startProcessing,
    startAiResponding,
    aiResponseEnded,
    pause,
    resume,
    complete,
    setError,
    reset,
  }
}
