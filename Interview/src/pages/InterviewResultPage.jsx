import { ArrowBackRounded, ArrowForwardRounded, AutoAwesomeRounded, CheckCircleRounded, EmojiEventsRounded, InsightsRounded, ReplayRounded, TrendingUpRounded, WarningAmberRounded } from '@mui/icons-material'
import { useInterviewFlow } from '../context/InterviewFlowContext'
import { useRouter } from '../routes/Router'
import { ROUTES } from '../routes/routes'
import { MOCK_RESULT } from '../data/resultData'
import { interviewApi } from '../services/interviewApi'
import { useEffect, useState } from 'react'

export default function InterviewResultPage() {
  const { setup, session } = useInterviewFlow()
  const { navigate } = useRouter()
  const [result, setResult] = useState(session?.result || null)
  const [loading, setLoading] = useState(Boolean(session?.id))
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    if (!session?.id || String(session.id).startsWith('mock-')) { setResult(MOCK_RESULT); setLoading(false); return () => { active = false } }
    interviewApi.getInterviewResult(session.id).then((data) => { if (active) setResult(data.result || MOCK_RESULT) }).catch((err) => { if (active) setError(err.message) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [session?.id])
  const report = result || MOCK_RESULT
  const role = setup.role || 'Software Engineer'
  return <main className="result-page">
    <div className="result-bg-orb orb-a" /><div className="result-bg-orb orb-b" />
    <section className="result-shell">
      <button className="result-back" onClick={() => navigate(ROUTES.HOME)}><ArrowBackRounded /> Back to dashboard</button>
      <header className="result-header">
        <div><span className="result-eyebrow"><AutoAwesomeRounded /> AI PERFORMANCE REPORT</span><h1>Your interview report is ready.</h1><p>Here is a focused breakdown of your <strong>{role}</strong> practice session.</p></div>
        <div className="result-actions"><button className="result-secondary" onClick={() => navigate(ROUTES.INTERVIEW_SETUP)}><ReplayRounded /> Practice again</button><button className="gradient-btn" onClick={() => navigate(ROUTES.HISTORY)}>View history <ArrowForwardRounded /></button></div>
      </header>
      {loading ? <div className="result-loading">Generating your AI performance report…</div> : null}{error ? <div className="result-error">{error}</div> : null}<section className="result-overview">
        <div className="score-card"><span className="score-label">OVERALL SCORE</span><div className="score-ring"><div><strong>{report.overallScore}</strong><small>/100</small></div></div><div className="score-grade"><EmojiEventsRounded /> {report.overallScore >= 85 ? 'Excellent' : report.overallScore >= 70 ? 'Strong' : 'Developing'} performance</div><p>Top {Math.max(1, 100 - (report.overallScore || 0))}% of your recent practice sessions</p></div>
        <div className="result-metrics"><div className="metrics-head"><div><span>Performance breakdown</span><small>AI-generated estimates based on this practice session</small></div><InsightsRounded /></div>{report.metrics ? report.metrics.map((metric) => <div className="metric-row" key={metric.key}><div className="metric-title"><strong>{metric.label}</strong><span>{metric.score}%</span></div><div className="metric-track"><i style={{width: metric.score+'%'}} /></div><small>{metric.note}</small></div>)}</div>
        <div className="session-card"><span>SESSION</span><strong>{role}</strong><div><small>Questions</small><b>{session?.questions?.length || report.total || setup.questionCount}</b></div><div><small>Answered</small><b>{session?.answers?.length || result.answered}</b></div><div><small>Duration</small><b>{report.duration || setup.durationMinutes + ' min'}</b></div></div>
      </section>
      <section className="result-two-col">
        <div className="insight-panel"><div className="panel-heading"><span className="panel-icon positive"><TrendingUpRounded /></span><div><h2>What you did well</h2><p>Strengths to carry into your next interview.</p></div></div><div className="insight-list">{(report.strengths || []).map((item) => <div key={item}><CheckCircleRounded /><span>{item}</span></div>)}</div></div>
        <div className="insight-panel"><div className="panel-heading"><span className="panel-icon improve"><WarningAmberRounded /></span><div><h2>Where to improve</h2><p>Small changes that can make your answers stronger.</p></div></div><div className="insight-list">{(report.improvements || []).map((item) => <div key={item}><WarningAmberRounded /><span>{item}</span></div>)}</div></div>
      </section>
      <section className="recommend-section"><div className="recommend-head"><div><span>PERSONALIZED NEXT STEPS</span><h2>Keep building your edge.</h2></div><AutoAwesomeRounded /></div><div className="recommend-grid">{(report.recommendations || []).map((item) => <button className="recommend-card" key={item.title} onClick={() => navigate(ROUTES.INTERVIEW_SETUP)}><span>{item.type}</span><strong>{item.title}</strong><small>{item.meta}</small><ArrowForwardRounded /></button>)}</div></section>
    </section>
  </main>
}
