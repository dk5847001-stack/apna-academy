export const CONVERSATION_STATES = Object.freeze({
  IDLE: 'idle',
  AI_SPEAKING: 'ai-speaking',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  AI_RESPONDING: 'ai-responding',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ERROR: 'error',
})

export const CONVERSATION_EVENTS = Object.freeze({
  START_AI_SPEAKING: 'START_AI_SPEAKING',
  AI_SPEECH_ENDED: 'AI_SPEECH_ENDED',
  START_LISTENING: 'START_LISTENING',
  STOP_LISTENING: 'STOP_LISTENING',
  START_PROCESSING: 'START_PROCESSING',
  START_AI_RESPONDING: 'START_AI_RESPONDING',
  AI_RESPONSE_ENDED: 'AI_RESPONSE_ENDED',
  PAUSE: 'PAUSE',
  RESUME: 'RESUME',
  COMPLETE: 'COMPLETE',
  ERROR: 'ERROR',
  RESET: 'RESET',
})

const canPause = new Set([
  CONVERSATION_STATES.IDLE,
  CONVERSATION_STATES.AI_SPEAKING,
  CONVERSATION_STATES.LISTENING,
  CONVERSATION_STATES.PROCESSING,
  CONVERSATION_STATES.AI_RESPONDING,
])

const nextAfterAiSpeech = (state) => (
  state.status === CONVERSATION_STATES.AI_SPEAKING
    ? CONVERSATION_STATES.IDLE
    : state.status
)

export const initialConversationState = Object.freeze({
  status: CONVERSATION_STATES.IDLE,
  resumeTo: null,
  error: '',
})

export function conversationReducer(state, action) {
  switch (action.type) {
    case CONVERSATION_EVENTS.START_AI_SPEAKING:
      return { ...state, status: CONVERSATION_STATES.AI_SPEAKING, resumeTo: null, error: '' }

    case CONVERSATION_EVENTS.AI_SPEECH_ENDED:
      return { ...state, status: nextAfterAiSpeech(state), error: '' }

    case CONVERSATION_EVENTS.START_LISTENING:
      return { ...state, status: CONVERSATION_STATES.LISTENING, resumeTo: null, error: '' }

    case CONVERSATION_EVENTS.STOP_LISTENING:
      return state.status === CONVERSATION_STATES.LISTENING
        ? { ...state, status: CONVERSATION_STATES.IDLE, error: '' }
        : state

    case CONVERSATION_EVENTS.START_PROCESSING:
      return { ...state, status: CONVERSATION_STATES.PROCESSING, resumeTo: null, error: '' }

    case CONVERSATION_EVENTS.START_AI_RESPONDING:
      return { ...state, status: CONVERSATION_STATES.AI_RESPONDING, resumeTo: null, error: '' }

    case CONVERSATION_EVENTS.AI_RESPONSE_ENDED:
      return state.status === CONVERSATION_STATES.AI_RESPONDING
        ? { ...state, status: CONVERSATION_STATES.IDLE, error: '' }
        : state

    case CONVERSATION_EVENTS.PAUSE:
      if (!canPause.has(state.status)) return state
      return { ...state, status: CONVERSATION_STATES.PAUSED, resumeTo: state.status, error: '' }

    case CONVERSATION_EVENTS.RESUME:
      return {
        ...state,
        status: action.status || state.resumeTo || CONVERSATION_STATES.IDLE,
        resumeTo: null,
        error: '',
      }

    case CONVERSATION_EVENTS.COMPLETE:
      return { ...state, status: CONVERSATION_STATES.COMPLETED, resumeTo: null, error: '' }

    case CONVERSATION_EVENTS.ERROR:
      return { ...state, status: CONVERSATION_STATES.ERROR, resumeTo: null, error: action.message || 'Conversation error.' }

    case CONVERSATION_EVENTS.RESET:
      return { ...initialConversationState }

    default:
      return state
  }
}
