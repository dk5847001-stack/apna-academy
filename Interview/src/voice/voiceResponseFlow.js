export const VOICE_RESPONSE_ACTIONS = Object.freeze({
  COMPLETE: 'complete',
  LISTEN_FOLLOW_UP: 'listen-follow-up',
  SPEAK_NEXT_QUESTION: 'speak-next-question',
  WAIT: 'wait',
})

export function resolveVoiceResponseAction({
  completed = false,
  nextQuestionId = '',
  nextQuestionIsFollowUp = false,
} = {}) {
  if (completed) return VOICE_RESPONSE_ACTIONS.COMPLETE
  if (!nextQuestionId) return VOICE_RESPONSE_ACTIONS.WAIT
  return nextQuestionIsFollowUp
    ? VOICE_RESPONSE_ACTIONS.LISTEN_FOLLOW_UP
    : VOICE_RESPONSE_ACTIONS.SPEAK_NEXT_QUESTION
}
