import test from 'node:test'
import assert from 'node:assert/strict'
import { createVoiceSilenceDetector } from '../src/voice/silenceDetection.js'

test('silence detector waits for silence before firing', async () => {
  let calls = 0
  const detector = createVoiceSilenceDetector({
    silenceMs: 20,
    onSilence: () => { calls += 1 },
  })

  detector.start()
  detector.signalSpeech()
  await new Promise((resolve) => setTimeout(resolve, 10))
  assert.equal(calls, 0)

  detector.signalSpeech()
  await new Promise((resolve) => setTimeout(resolve, 30))
  assert.equal(calls, 1)

  detector.stop()
})

test('new speech resets the silence countdown', async () => {
  let calls = 0
  const detector = createVoiceSilenceDetector({
    silenceMs: 20,
    onSilence: () => { calls += 1 },
  })

  detector.start()
  detector.signalSpeech()
  await new Promise((resolve) => setTimeout(resolve, 12))
  detector.signalSpeech()
  await new Promise((resolve) => setTimeout(resolve, 12))
  assert.equal(calls, 0)

  await new Promise((resolve) => setTimeout(resolve, 15))
  assert.equal(calls, 1)

  detector.stop()
})

test('stopping cancels pending silence submission', async () => {
  let calls = 0
  const detector = createVoiceSilenceDetector({
    silenceMs: 20,
    onSilence: () => { calls += 1 },
  })

  detector.start()
  detector.signalSpeech()
  detector.stop()
  await new Promise((resolve) => setTimeout(resolve, 30))
  assert.equal(calls, 0)
})
