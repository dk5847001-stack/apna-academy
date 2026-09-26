import test from 'node:test'
import assert from 'node:assert/strict'
import {
  VOICE_RESPONSE_ACTIONS,
  resolveVoiceResponseAction,
} from '../src/voice/voiceResponseFlow.js'

test('completed interview ends the voice turn', () => {
  assert.equal(
    resolveVoiceResponseAction({ completed: true, nextQuestionId: 'q2' }),
    VOICE_RESPONSE_ACTIONS.COMPLETE
  )
})

test('a server-selected follow-up resumes listening without repeating the question', () => {
  assert.equal(
    resolveVoiceResponseAction({
      nextQuestionId: 'q1-followup',
      nextQuestionIsFollowUp: true,
    }),
    VOICE_RESPONSE_ACTIONS.LISTEN_FOLLOW_UP
  )
})

test('a normal next question starts a new question speech turn', () => {
  assert.equal(
    resolveVoiceResponseAction({
      nextQuestionId: 'q2',
      nextQuestionIsFollowUp: false,
    }),
    VOICE_RESPONSE_ACTIONS.SPEAK_NEXT_QUESTION
  )
})

test('missing next question waits instead of starting an unsafe voice turn', () => {
  assert.equal(
    resolveVoiceResponseAction(),
    VOICE_RESPONSE_ACTIONS.WAIT
  )
})
