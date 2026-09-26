import { ArrowBackRounded, ArrowForwardRounded, AutoAwesomeRounded, CheckCircleRounded, EmojiEventsRounded, InsightsRounded, ReplayRounded, TrendingUpRounded, WarningAmberRounded } from '@mui/icons-material'
import { useEffect, useMemo, useState } from 'react'
import { useInterviewFlow } from '../context/InterviewFlowContext'
import { useRouter } from '../routes/Router'
import { ROUTES } from '../routes/routes'
import { interviewApi } from '../services/interviewApi'
import { readPersistent, removePersistent } from '../utils/storage'

const emptyResult = {
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

const clampScore = (value) => Math.max(0, Math.min(100, Number(value) || 0))

export default function InterviewResultPage() {
  const { setup, session, setSession } = useInterviewFlow()
  const { navigate } = useRouter()
  const selectedId = readPersistent('selectedInterviewSessionId', '')
  const sessionId = session?.id || session?._id || selectedId
  const [report, setReport] = useState(session?.result || null)
  const [resultSession, setResultSession] = useState(session || null)
  const [loading, setLoading] = useState(Boolean(sessionId))
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    if (!sessionId || String(sessionId).startsWith('mock-')) {
      setLoading(false)
      setError('No completed interview session was selected. Open a completed session from Interview History.')
      return () => { active = false }
    }

    setLoading(true)
    setError('')
    interviewApi.getInterviewResult(sessionId)
      .then((data) => {
        if (!active) return
        if (!data?._id && !data?.id) throw new Error('The interview report is unavailable.')
        setResultSession(data)
        setReport(data.result || null)
        setSession({
          ...data,
          id: String(data._id || data.id),
          setup: data.setup || setup,
          questions: data.questions || [],
          answers: data.answers || [],
        })
        removePersistent('selectedInterviewSessionId')
      })
      .catch((err) => {
        if (active) setError(err?.message || 'Unable to load your interview report.')
      })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [sessionId])

  const result = report || emptyResult
  const activeSetup = resultSession?.setup || setup
  const role = activeSetup?.role || 'Software Engineer'
  const answers = Array.isArray(resultSession?.answers) ? resultSession.answers : []
  const metrics = useMemo(() => [
    { key: 'technical', label: 'Technical Knowledge', score: clampScore(result.technical ?? result.overallScore), note: 'Technical reasoning and role fundamentals.' },
    { key: 'communication', label: 'Communication', score: clampScore(result.communication ?? result.overallScore), note: 'Clarity and structure of your responses.' },
    { key: 'confidence', label: 'Confidence', score: clampScore(result.confidence ?? result.overallScore), note: 'Presence, consistency and answer confidence.' },
    { key: 'problemSolving', label: 'Problem Solving', score: clampScore(result.problemSolving ?? result.overallScore), note: 'Reasoning quality and decision making.' },
  ], [result])

  const recommendations = (result.recommendations || []).map((item) => typeof item === 'string'
    ? { title: item, meta: 'Personalized learning topic', type: 'practice' }
    : item)

  return <main className="result-page">
    <div className="result-bg-orb orb-a" /><div className="result-bg-orb orb-b" />
    <section className="result-shell">
      <button className="result-back" type="button" onClick={() => navigate(ROUTES.HISTORY)}><ArrowBackRounded /> Back to history</button>
      <header className="result-header">
        <div><span className="result-eyebrow"><AutoAwesomeRounded /> AI PERFORMANCE REPORT</span><h1>Your interview report is ready.</h1><p>Here is a focused breakdown of your <strong>{role}</strong> practice session.</p></div>
        <div className="result-actions"><button className="result-secondary" type="button" onClick={() => navigate(ROUTES.INTERVIEW_SETUP)}><ReplayRounded /> Practice again</button><button className="gradient-btn" type="button" onClick={() => navigate(ROUTES.HISTORY)}>View history <ArrowForwardRounded /></button></div>
      </header>

      {loading ? <div className="result-loading" role="status">Loading your saved interview report…</div> : null}
      {error ? <div className="result-error" role="alert"><WarningAmberRounded /> <span>{error}</span><button type="button" onClick={() => navigate(ROUTES.HISTORY)}>Open history</button></div> : null}

      {!loading && !error && !report ? <div className="result-error" role="alert"><WarningAmberRounded /> This session has no generated final report yet. Return to Interview History and select a completed session.</div> : null}

      {!loading && !error && report ? <>
        <section className="result-overview">
          <div className="score-card"><span className="score-label">OVERALL SCORE</span><div className="score-ring" style={{ background: `conic-gradient(#7040eb ${clampScore(result.overallScore)}%, #e8eaf4 0)` }}><div><strong>{clampScore(result.overallScore)}</strong><small>/100</small></div></div><div className="score-grade"><EmojiEventsRounded /> AI-generated performance summary</div><p>Based on the answers saved for this interview session.</p></div>
          <div className="result-metrics"><div className="metrics-head"><div><span>Performance breakdown</span><small>Generated from this session's evaluated answers</small></div><InsightsRounded /></div>{metrics.map((metric) => <div className="metric-row" key={metric.key}><div className="metric-title"><strong>{metric.label}</strong><span>{metric.score}%</span></div><div className="metric-track"><i style={{ width: metric.score + '%' }} /></div><small>{metric.note}</small></div>)}</div>
          <div className="session-card"><span>SESSION</span><strong>{role}</strong><div><small>Questions</small><b>{resultSession?.questions?.length || activeSetup.questionCount || 0}</b></div><div><small>Answered</small><b>{answers.length}</b></div><div><small>Status</small><b>{resultSession?.status || 'completed'}</b></div></div>
        </section>

        <section className="result-summary-card"><span>AI SUMMARY</span><p>{result.summary || 'No summary was returned for this session.'}</p></section>

        <section className="result-two-col">
          <div className="insight-panel"><div className="panel-heading"><span className="panel-icon positive"><TrendingUpRounded /></span><div><h2>What you did well</h2><p>Strengths identified from your answers.</p></div></div><div className="insight-list">{(result.strengths || []).map((item) => <div key={item}><CheckCircleRounded /><span>{item}</span></div>)}</div></div>
          <div className="insight-panel"><div className="panel-heading"><span className="panel-icon improve"><WarningAmberRounded /></span><div><h2>Where to improve</h2><p>Actionable areas from this interview.</p></div></div><div className="insight-list">{(result.improvements || []).map((item) => <div key={item}><WarningAmberRounded /><span>{item}</span></div>)}</div></div>
        </section>

        <section className="result-answers"><div className="recommend-head"><div><span>ANSWER REVIEW</span><h2>Question-by-question feedback.</h2></div><AutoAwesomeRounded /></div>{answers.length ? <div className="answer-review-list">{answers.map((item, index) => <article className="answer-review-card" key={item.questionId || index}><div className="answer-review-top"><span>QUESTION {String(index + 1).padStart(2, '0')}</span><strong>{clampScore(item.score)} / 100</strong></div><h3>{item.question}</h3><p className="answer-review-text">{item.answer}</p>{item.feedback ? <p className="answer-review-feedback"><strong>AI feedback:</strong> {item.feedback}</p> : null}{item.spokenResponse ? <p className="answer-review-spoken"><strong>Interviewer:</strong> {item.spokenResponse}</p> : null}<div className="answer-review-tags">{(item.strengths || []).map((tag) => <span key={tag}>{tag}</span>)}{(item.improvements || []).map((tag) => <span key={tag}>{tag}</span>)}</div></article>)}</div> : <div className="result-empty-detail">No individual answers were returned for this session.</div>}</section>

        <section className="recommend-section"><div className="recommend-head"><div><span>PERSONALIZED NEXT STEPS</span><h2>Keep building your skills.</h2></div><AutoAwesomeRounded /></div><div className="recommend-grid">{recommendations.map((item, index) => <button className="recommend-card" key={item.title || index} type="button" onClick={() => navigate(ROUTES.INTERVIEW_SETUP)}><span>{item.type}</span><strong>{item.title}</strong><small>{item.meta}</small><ArrowForwardRounded /></button>)}</div></section>
      </> : null}
    </section>
  </main>
}
