import { AccessTimeRounded, ArrowForwardRounded, AutoAwesomeRounded, CalendarMonthRounded, FilterListRounded, InsightsRounded, SearchRounded, TrendingUpRounded } from '@mui/icons-material'
import { useRouter } from '../routes/Router'
import { ROUTES } from '../routes/routes'
import { useEffect, useMemo, useState } from 'react'
import { interviewApi } from '../services/interviewApi'
import { writePersistent } from '../utils/storage'
import { calculateAverageScore, calculateBestScore, mapHistoryItem } from '../utils/resultAnalytics'

export default function InterviewHistoryPage() {
  const { navigate } = useRouter()
  const [query, setQuery] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    interviewApi.getInterviewHistory()
      .then((items) => { if (active) setHistory(Array.isArray(items) ? items.map(mapHistoryItem).filter((item) => item.id) : []) })
      .catch((err) => { if (active) setError(err?.message || 'Unable to load interview history.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const filtered = useMemo(() => history.filter((item) => (item.role + ' ' + item.type).toLowerCase().includes(query.toLowerCase().trim())), [history, query])
  const average = calculateAverageScore(history)
  const best = calculateBestScore(history)
  const openResult = (sessionId) => { writePersistent('selectedInterviewSessionId', sessionId); navigate(ROUTES.INTERVIEW_RESULT) }

  return <main className="history-page"><section className="history-shell">
    <header className="history-header"><div><span className="result-eyebrow"><AutoAwesomeRounded /> PRACTICE HISTORY</span><h1>Your interview history.</h1><p>Review completed sessions and open the report generated from that session.</p></div><button className="gradient-btn" type="button" onClick={() => navigate(ROUTES.INTERVIEW_SETUP)}>New interview <ArrowForwardRounded /></button></header>
    <section className="history-insights"><div><span><InsightsRounded /></span><div><small>Average score</small><strong>{history.length ? average + ' / 100' : '—'}</strong></div></div><div><span><TrendingUpRounded /></span><div><small>Best score</small><strong>{history.length ? best + ' / 100' : '—'}</strong></div></div><div><span><CalendarMonthRounded /></span><div><small>Sessions</small><strong>{history.length}</strong></div></div></section>
    <section className="history-table-card"><div className="history-toolbar"><div className="history-search"><SearchRounded /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search role or interview type…" aria-label="Search interview history" /></div><span className="history-result-count">{filtered.length} session{filtered.length === 1 ? '' : 's'}</span><button type="button" disabled><FilterListRounded /> Filters</button></div>
    {loading ? <div className="history-empty" role="status"><AutoAwesomeRounded /><strong>Loading interview history…</strong></div> : null}
    {error && !loading ? <div className="history-empty" role="alert"><span className="history-error-icon">!</span><strong>{error}</strong><span>Please refresh and try again.</span></div> : null}
    {!loading && !error && filtered.length > 0 ? <div className="history-list">{filtered.map((item) => <div className="history-row" key={item.id}><div className="history-role"><span className="history-avatar"><AutoAwesomeRounded /></span><div><strong>{item.role}</strong><small>{item.type}</small></div></div><div className="history-date"><CalendarMonthRounded />{item.date}</div><div className="history-duration"><AccessTimeRounded />{item.duration}</div><div className="history-score"><strong>{item.score}</strong><small>/100</small></div><button className="history-open" type="button" onClick={() => openResult(item.id)} aria-label="Open interview report"><ArrowForwardRounded /></button></div>)}</div> : null}
    {!loading && !error && filtered.length === 0 ? <div className="history-empty"><SearchRounded /><strong>{history.length ? 'No sessions found' : 'No completed interviews yet'}</strong><span>{history.length ? 'Try another role or interview type.' : 'Complete an interview to see its report here.'}</span><button className="gradient-btn" type="button" onClick={() => navigate(ROUTES.INTERVIEW_SETUP)}>Start an interview <ArrowForwardRounded /></button></div> : null}
    </section></section></main>
  return null
}