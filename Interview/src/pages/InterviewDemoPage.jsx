import { AutoAwesomeRounded, CheckCircleRounded, PlayArrowRounded, ArrowForwardRounded, MicRounded, PsychologyRounded, TimerRounded } from '@mui/icons-material'
import { useRouter } from '../routes/Router'
import { ROUTES } from '../routes/routes'

const STEPS = [
  ['01','Choose your role','Select the role you want to practice and set your interview preferences.'],
  ['02','Meet your AI interviewer','Answer realistic questions with guided voice and interview interaction.'],
  ['03','Get a clear report','Review your performance, strengths and areas to practice next.'],
]

export default function InterviewDemoPage() {
  const { navigate } = useRouter()
  return <main className="demo-page demo-page-ref">
    <section className="demo-shell">
      <div className="demo-hero">
        <div className="demo-copy">
          <span className="demo-eyebrow"><AutoAwesomeRounded /> AI INTERVIEW DEMO</span>
          <h1>See how your AI interview practice works.</h1>
          <p>Take a quick look at the experience before you start. The real session adapts questions to your role, keeps time, and gives you a structured performance report.</p>
          <div className="demo-actions">
            <button className="gradient-btn" onClick={() => navigate(ROUTES.INTERVIEW_SETUP)}>Start practicing <ArrowForwardRounded /></button>
            <button className="demo-secondary" onClick={() => navigate(ROUTES.HOME)}>Back to home</button>
          </div>
          <div className="demo-trust"><CheckCircleRounded /> No setup complexity <span>•</span><CheckCircleRounded /> Beginner friendly <span>•</span><CheckCircleRounded /> Practice at your pace</div>
        </div>
        <div className="demo-preview">
          <div className="demo-preview-top"><span><span className="demo-dot" /> Live preview</span><span>AI Interview</span></div>
          <div className="demo-avatar"><PsychologyRounded /></div>
          <strong>Tell me about yourself.</strong>
          <p>Speak naturally. Your answer is captured for the interview flow.</p>
          <div className="demo-wave"><i/><i/><i/><i/><i/><i/><i/><i/><i/></div>
          <div className="demo-preview-meta"><span><MicRounded /> Voice enabled</span><span><TimerRounded /> Timed session</span></div>
          <button className="demo-play" onClick={() => navigate(ROUTES.INTERVIEW_SETUP)}><PlayArrowRounded /> Try the experience</button>
        </div>
      </div>
      <div className="demo-steps">{STEPS.map(([n,t,d])=><article key={n}><span>{n}</span><h2>{t}</h2><p>{d}</p></article>)}</div>
    </section>
  </main>
}
