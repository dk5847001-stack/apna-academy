export const DEFAULT_VOICE_SILENCE_MS = 2200

export function createVoiceSilenceDetector({ silenceMs = DEFAULT_VOICE_SILENCE_MS, onSilence } = {}) {
  const delay = Math.max(50, Number(silenceMs) || DEFAULT_VOICE_SILENCE_MS)
  let timer = null
  let active = false

  const clearTimer = () => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  const stop = () => {
    active = false
    clearTimer()
  }

  const signalSpeech = () => {
    if (!active) return
    clearTimer()
    timer = setTimeout(() => {
      timer = null
      if (!active) return
      active = false
      onSilence?.()
    }, delay)
  }

  const start = () => {
    active = true
    clearTimer()
  }

  return Object.freeze({
    start,
    signalSpeech,
    stop,
  })
}
