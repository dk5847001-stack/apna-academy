import { ArrowBackRounded, ArrowForwardRounded, AutoAwesomeRounded, CheckCircleRounded, EmojiEventsRounded, InsightsRounded, ReplayRounded, TrendingUpRounded, WarningAmberRounded } from '@mui/icons-material'
import { useEffect, useState } from 'react'
import { useInterviewFlow } from '../context/InterviewFlowContext'
import { useRouter } from '../routes/Router'
import { ROUTES } from '../routes/routes'
import { MOCK_RESULT } from '../data/resultData'
import { interviewApi } from '../services/interviewApi'

export default function InterviewResultPage() {
  const { setup, session } = useInterviewFlow()
  const { navigate } = useRouter()
  const [report, setReport] = useState(session?.result || null)
  const [loading, setLoading] = useState(Boolean(session?.id && !session?.result))
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    if (!session?.id || String(session.id).startsWith('mock-')) {
      setReport(MOCK_RESULT)
      setLoading(false)
      return () => { active = false }
    }
    interviewApi.getInterviewResult(session.id)
      .then((data) => { if (active) setReport(data.result || MOCK_RESULT) })
      .catch((err) => { if (active) setError(err.message || 'Unable to load your report.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [session?.id])

  const result = report || {
    overallScore: 0,
    technical: 0,
    communication: 0,
    confidence: 0,
    problemSolving: 0,
    strengths: [],
    improvements: [],
    recommendations: [],
    summary: '',
  }
  const role = setup.role || 'Software Engineer'
  const metrics = result.metrics || [
    { key: 'technical', label: 'Technical Knowledge', score: result.technical ?? result.overallScore, note: 'Technical reasoning and role fundamentals.' },
    { key: 'communication', label: 'Communication', score: result.communication ?? result.overallScore, note: 'Clarity and structure of your responses.' },
    { key: 'confidence', label: 'Confidence', score: result.confidence ?? result.overallScore, note: 'Presence, consistency and answer confidence.' },
    { key: 'problemSolving', label: 'Problem Solving', score: result.problemSolving ?? result.overallScore, note: 'Reasoning quality and decision making.' },
  ]
  const recommendations = (result.recommendations || []).map((item) => typeof item === 'string' ? { title: item, meta: 'Personalized learning topic', type: 'practice' } : item)

  return <main className="result-page">
    <div className="result-bg-orb orb-a" /><div className="result-bg-orb orb-b" />
    <section className="result-shell">
      <button className="result-back" onClick={() => navigate(ROUTES.HOME)}><ArrowBackRounded /> Back to dashboard</button>
      <header className="result-header">
        <div><span className="result-eyebrow"><AutoAwesomeRounded /> AI PERFORMANCE REPORT</span><h1>Your interview report is ready.</h1><p>Here is a focused breakdown of your <strong>{role}</strong> practice session.</p></div>
        <div className="result-actions"><button className="result-secondary" onClick={() => navigate(ROUTES.INTERVIEW_SETUP)}><ReplayRounded /> Practice again</button><button className="gradient-btn" onClick={() => navigate(ROUTES.HISTORY)}>View history <ArrowForwardRounded /></button></div>
      </header>
      {loading ? <div className="result-loading">Generating your AI performance report…</div> : null}
      {error ? <div className="result-error" role="alert"><WarningAmberRounded /> {error}</div> : null}
      {!loading && !report && !error ? <div className="result-error" role="status"><WarningAmberRounded /> This session does not have a generated report yet. Return to the interview and complete at least one answer.</div> : null}
      <section className="result-overview">
        <div className="score-card"><span className="score-label">OVERALL SCORE</span><div className="score-ring" style={{ background: `conic-gradient(#7040eb ${result.overallScore}%, #e8eaf4 0)` }}><div><strong>{result.overallScore}</strong><small>/100</small></div></div><div className="score-grade"><EmojiEventsRounded /> {result.overallScore >= 85 ? 'Excellent' : result.overallScore >= 70 ? 'Strong' : 'Developing'} performance</div><p>AI-generated score from this interview session</p></div>
        <div className="result-metrics"><div className="metrics-head"><div><span>Performance breakdown</span><small>AI-generated estimates based on your answers</small></div><InsightsRounded /></div>{metrics.map((metric) => <div className="metric-row" key={metric.key}><div className="metric-title"><strong>{metric.label}</strong><span>{metric.score}%</span></div><div className="metric-track"><i style={{ width: metric.score + '%' }} /></div><small>{metric.note}</small></div>)}</div>
        <div className="session-card"><span>SESSION</span><strong>{role}</strong><div><small>Questions</small><b>{session?.questions?.length || setup.questionCount}</b></div><div><small>Answered</small><b>{session?.answers?.length || 0}</b></div><div><small>Duration</small><b>{setup.durationMinutes} min</b></div></div>
      </section>
      <section className="result-two-col">
        <div className="insight-panel"><div className="panel-heading"><span className="panel-icon positive"><TrendingUpRounded /></span><div><h2>What you did well</h2><p>Strengths identified from your answers.</p></div></div><div className="insight-list">{(result.strengths || []).map((item) => <div key={item}><CheckCircleRounded /><span>{item}</span></div>)}</div></div>
        <div className="insight-panel"><div className="panel-heading"><span className="panel-icon improve"><WarningAmberRounded /></span><div><h2>Where to improve</h2><p>Actionable areas for your next practice.</p></div></div><div className="insight-list">{(result.improvements || []).map((item) => <div key={item}><WarningAmberRounded /><span>{item}</span></div>)}</div></div>
      </section>
      <section className="recommend-section"><div className="recommend-head"><div><span>PERSONALIZED NEXT STEPS</span><h2>Keep building your edge.</h2></div><AutoAwesomeRounded /></div><div className="recommend-grid">{recommendations.map((item) => <button className="recommend-card" key={item.title} onClick={() => navigate(ROUTES.INTERVIEW_SETUP)}><span>{item.type}</span><strong>{item.title}</strong><small>{item.meta}</small><ArrowForwardRounded /></button>)}</div></section>
    </section>
  </main>
}
