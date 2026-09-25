import { ArrowForwardRounded, CheckCircleRounded, HomeRounded } from '@mui/icons-material'
import { useInterviewFlow } from '../context/InterviewFlowContext'
import { useRouter } from '../routes/Router'
import { ROUTES } from '../routes/routes'

export default function InterviewCompletePage() {
  const { setup, session } = useInterviewFlow()
  const { navigate } = useRouter()
  const answered = session?.answers?.filter((item) => item?.answer?.trim()).length || 0

  return (
    <main className="complete-page">
      <div className="room-orb room-orb-a" /><div className="room-orb room-orb-b" />
      <section className="complete-card">
        <span className="complete-icon"><CheckCircleRounded /></span>
        <span className="room-eyebrow">INTERVIEW FINISHED</span>
        <h1>Great work. Your interview is complete.</h1>
        <p>Your answers are saved for this practice session. Continue to the results screen to review your performance breakdown.</p>
        <div className="complete-stats">
          <div><small>Role</small><strong>{setup.role || 'Interview'}</strong></div>
          <div><small>Questions</small><strong>{setup.questionCount}</strong></div>
          <div><small>Answered</small><strong>{answered}</strong></div>
        </div>
        <div className="complete-actions">
          <button className="gradient-btn" type="button" onClick={() => navigate(ROUTES.INTERVIEW_RESULT)}>View interview results <ArrowForwardRounded /></button>
          <button className="secondary-complete-btn" type="button" onClick={() => navigate(ROUTES.HOME)}><HomeRounded /> Back home</button>
        </div>
      </section>
    </main>
  )
}
