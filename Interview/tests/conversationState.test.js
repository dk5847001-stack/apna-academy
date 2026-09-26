import test from 'node:test'
import assert from 'node:assert/strict'
import {
  CONVERSATION_EVENTS,
  CONVERSATION_STATES,
  conversationReducer,
  initialConversationState,
} from '../src/conversation/conversationState.js'

const reduce = (state, type, extra = {}) => conversationReducer(state, { type, ...extra })

test('conversation lifecycle moves through AI speaking and candidate turn', () => {
  let state = initialConversationState

  state = reduce(state, CONVERSATION_EVENTS.START_AI_SPEAKING)
  assert.equal(state.status, CONVERSATION_STATES.AI_SPEAKING)

  state = reduce(state, CONVERSATION_EVENTS.AI_SPEECH_ENDED)
  assert.equal(state.status, CONVERSATION_STATES.IDLE)

  state = reduce(state, CONVERSATION_EVENTS.START_LISTENING)
  assert.equal(state.status, CONVERSATION_STATES.LISTENING)

  state = reduce(state, CONVERSATION_EVENTS.STOP_LISTENING)
  assert.equal(state.status, CONVERSATION_STATES.IDLE)
})

test('processing and AI response states are explicit and recover to idle', () => {
  let state = reduce(initialConversationState, CONVERSATION_EVENTS.START_PROCESSING)
  assert.equal(state.status, CONVERSATION_STATES.PROCESSING)

  state = reduce(state, CONVERSATION_EVENTS.START_AI_RESPONDING)
  assert.equal(state.status, CONVERSATION_STATES.AI_RESPONDING)

  state = reduce(state, CONVERSATION_EVENTS.AI_RESPONSE_ENDED)
  assert.equal(state.status, CONVERSATION_STATES.IDLE)
})

test('pause preserves the active phase and explicit resume can choose a safe state', () => {
  let state = reduce(initialConversationState, CONVERSATION_EVENTS.START_AI_SPEAKING)
  state = reduce(state, CONVERSATION_EVENTS.PAUSE)

  assert.equal(state.status, CONVERSATION_STATES.PAUSED)
  assert.equal(state.resumeTo, CONVERSATION_STATES.AI_SPEAKING)

  state = reduce(state, CONVERSATION_EVENTS.RESUME, { status: CONVERSATION_STATES.IDLE })
  assert.equal(state.status, CONVERSATION_STATES.IDLE)
  assert.equal(state.resumeTo, null)
})

test('completion and error states are terminal until reset', () => {
  let state = reduce(initialConversationState, CONVERSATION_EVENTS.COMPLETE)
  assert.equal(state.status, CONVERSATION_STATES.COMPLETED)

  state = reduce(state, CONVERSATION_EVENTS.ERROR, { message: 'voice failed' })
  assert.equal(state.status, CONVERSATION_STATES.ERROR)
  assert.equal(state.error, 'voice failed')

  state = reduce(state, CONVERSATION_EVENTS.RESET)
  assert.deepEqual(state, initialConversationState)
})
