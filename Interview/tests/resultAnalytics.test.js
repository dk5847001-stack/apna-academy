import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateAverageScore, calculateBestScore, clampScore, mapHistoryItem } from '../src/utils/resultAnalytics.js'

test('clampScore keeps report metrics inside the public 0-100 range', () => {
  assert.equal(clampScore(-10), 0)
  assert.equal(clampScore(42), 42)
  assert.equal(clampScore(140), 100)
  assert.equal(clampScore('invalid'), 0)
})

test('history mapping uses persisted server data without mock records', () => {
  const item = mapHistoryItem({
    _id: 'session-1',
    setup: { role: 'Backend Developer', interviewType: 'technical', durationMinutes: 30 },
    result: { overallScore: 87 },
    status: 'completed',
    completedAt: '2026-09-26T05:00:00.000Z',
  })
  assert.equal(item.id, 'session-1')
  assert.equal(item.role, 'Backend Developer')
  assert.equal(item.score, 87)
  assert.equal(item.duration, '30 min')
})

test('history analytics calculate deterministic average and best scores', () => {
  const items = [{ score: 70 }, { score: 80 }, { score: 95 }]
  assert.equal(calculateAverageScore(items), 82)
  assert.equal(calculateBestScore(items), 95)
})
