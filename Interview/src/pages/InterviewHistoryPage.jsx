import { AccessTimeRounded, ArrowForwardRounded, AutoAwesomeRounded, CalendarMonthRounded, ChevronRightRounded, FilterListRounded, InsightsRounded, ReplayRounded, SearchRounded } from '@mui/icons-material'
import { useRouter } from '../routes/Router'
import { ROUTES } from '../routes/routes'
import { MOCK_HISTORY } from '../data/resultData'
import { useEffect, useState } from 'react'
import { interviewApi } from '../services/interviewApi'
import CosmicField from '../components/common/CosmicField'

export default function InterviewHistoryPage() {
  const { navigate } = useRouter()
  const [query, setQuery] = useState('')
  const [history, setHistory] = useState(MOCK_HISTORY)
  const [loading, setLoading] = useState(true)
  useEffect(() => { let active = true; interviewApi.getInterviewHistory().then((items) => { if (active && Array.isArray(items)) setHistory(items.map((item) => ({ id: item._id, role: item.setup?.role || 'Interview', type: item.setup?.interviewType || 'Technical', score: item.result?.overallScore ?? 0, date: item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 'Recent', duration: (item.setup?.durationMinutes || 0) + ' min', status: item.status })) ) }).catch(() => {}).finally(() => { if (active) setLoading(false) }); return () => { active = false } }, [])
  const filtered = history.filter((item) => (item.role+' '+item.type).toLowerCase().includes(query.toLowerCase()))
  const average = history.length ? Math.round(history.reduce((sum, item) => sum + Number(item.score || 0), 0) / history.length) : 0
  const best = history.length ? Math.max(...history.map((item) => Number(item.score || 0))) : 0
  return <main className="history-page cosmic-history-page"><CosmicField density="hero" /><div className="history-ambient history-ambient-one" aria-hidden="true" /><div className="history-ambient history-ambient-two" aria-hidden="true" /><section className="history-shell">
    <header className="history-header cosmic-history-header"><div><span className="result-eyebrow"><AutoAwesomeRounded /> PRACTICE HISTORY</span><h1>Your interview history.</h1><p>Review previous sessions, compare scores, and jump back into practice.</p></div><button className="gradient-btn history-new-btn" onClick={() => navigate(ROUTES.INTERVIEW_SETUP)}><AutoAwesomeRounded /> New interview <ArrowForwardRounded /></button></header>
    <section className="history-insights cosmic-history-insights"><div><span><InsightsRounded /></span><div><small>Average score</small><strong>{average} / 100</strong></div></div><div><span><TrendingUpIcon /></span><div><small>Best score</small><strong>{best} / 100</strong></div></div><div><span><CalendarMonthRounded /></span><div><small>Sessions</small><strong>{history.length}</strong></div></div></section>
    <section className="history-table-card cosmic-history-card">{loading ? <div className="history-empty cosmic-empty"><AutoAwesomeRounded /><strong>Loading interview history…</strong></div> : null}<div className="history-toolbar cosmic-history-toolbar"><div className="history-search cosmic-history-search"><SearchRounded /><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search role or interview type…" /></div><button><FilterListRounded /> Filters</button></div><div className="history-list cosmic-history-list">{filtered.map((item)=><div className="history-row cosmic-history-row" key={item.id}><div className="history-role"><span className="history-avatar"><AutoAwesomeRounded /></span><div><strong>{item.role}</strong><small>{item.type}</small></div></div><div className="history-date"><CalendarMonthRounded />{item.date}</div><div className="history-duration"><AccessTimeRounded />{item.duration}</div><div className="history-score"><strong>{item.score}</strong><small>/100</small></div><button className="history-open" onClick={()=>navigate(ROUTES.INTERVIEW_RESULT)} aria-label="Open report"><ChevronRightRounded /></button></div>)}</div>{filtered.length===0?<div className="history-empty"><SearchRounded /><strong>No sessions found</strong><span>Try another role or interview type.</span></div>:null}</section>
  </section></main>
}
function TrendingUpIcon(){ return <span style={{fontSize:18}}>↗</span> }
