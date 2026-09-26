export const clampScore = (value) => Math.max(0, Math.min(100, Number(value) || 0))

export const mapHistoryItem = (item = {}) => ({
  id: String(item._id || item.id || ''),
  role: String(item.setup?.role || 'Interview'),
  type: String(item.setup?.interviewType || 'Technical'),
  score: clampScore(item.result?.overallScore),
  date: item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 'Not completed',
  duration: item.setup?.durationMinutes ? item.setup.durationMinutes + ' min' : '—',
  status: String(item.status || 'completed'),
})

export const calculateAverageScore = (items = []) => {
  if (!items.length) return 0
  return Math.round(items.reduce((sum, item) => sum + clampScore(item.score), 0) / items.length)
}

export const calculateBestScore = (items = []) => items.length ? Math.max(...items.map((item) => clampScore(item.score))) : 0
