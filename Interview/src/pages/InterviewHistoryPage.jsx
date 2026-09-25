import { AccessTimeRounded, ArrowForwardRounded, AutoAwesomeRounded, CalendarMonthRounded, ChevronRightRounded, FilterListRounded, InsightsRounded, ReplayRounded, SearchRounded } from '@mui/icons-material'
import { useRouter } from '../routes/Router'
import { ROUTES } from '../routes/routes'
import { MOCK_HISTORY } from '../data/resultData'
import { useState } from 'react'

export default function InterviewHistoryPage() {
  const { navigate } = useRouter()
  const [query, setQuery] = useState('')
  const filtered = MOCK_HISTORY.filter((item) => (item.role+' '+item.type).toLowerCase().includes(query.toLowerCase()))
  return <main className="history-page"><section className="history-shell">
    <header className="history-header"><div><span className="result-eyebrow"><AutoAwesomeRounded /> PRACTICE HISTORY</span><h1>Your interview history.</h1><p>Review previous sessions, compare scores, and jump back into practice.</p></div><button className="gradient-btn" onClick={() => navigate(ROUTES.INTERVIEW_SETUP)}>New interview <ArrowForwardRounded /></button></header>
    <section className="history-insights"><div><span><InsightsRounded /></span><div><small>Average score</small><strong>79 / 100</strong></div></div><div><span><TrendingUpIcon /></span><div><small>Best score</small><strong>88 / 100</strong></div></div><div><span><CalendarMonthRounded /></span><div><small>Sessions</small><strong>{MOCK_HISTORY.length}</strong></div></div></section>
    <section className="history-table-card"><div className="history-toolbar"><div className="history-search"><SearchRounded /><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search role or interview type…" /></div><button><FilterListRounded /> Filters</button></div><div className="history-list">{filtered.map((item)=><div className="history-row" key={item.id}><div className="history-role"><span className="history-avatar"><AutoAwesomeRounded /></span><div><strong>{item.role}</strong><small>{item.type}</small></div></div><div className="history-date"><CalendarMonthRounded />{item.date}</div><div className="history-duration"><AccessTimeRounded />{item.duration}</div><div className="history-score"><strong>{item.score}</strong><small>/100</small></div><button className="history-open" onClick={()=>navigate(ROUTES.INTERVIEW_RESULT)} aria-label="Open report"><ChevronRightRounded /></button></div>)}</div>{filtered.length===0?<div className="history-empty"><SearchRounded /><strong>No sessions found</strong><span>Try another role or interview type.</span></div>:null}</section>
  </section></main>
}
function TrendingUpIcon(){ return <span style={{fontSize:18}}>↗</span> }
