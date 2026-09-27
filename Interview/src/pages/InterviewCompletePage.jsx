import { ArrowForwardRounded, CheckCircleRounded, HomeRounded, InsightsRounded } from '@mui/icons-material'
import { useInterviewFlow } from '../context/InterviewFlowContext'
import { useRouter } from '../routes/Router'
import { ROUTES } from '../routes/routes'

export default function InterviewCompletePage() {
  const { setup, session } = useInterviewFlow()
  const { navigate } = useRouter()
  const answered = session?.answers?.filter((item) => item?.answer?.trim()).length || 0
  const totalQuestions = setup.questionCount || session?.answers?.length || 0

  return (
    <main className="complete-page complete-page-ref">
      <div className="complete-glow complete-glow-a" aria-hidden="true" />
      <div className="complete-glow complete-glow-b" aria-hidden="true" />

      <section className="complete-card complete-card-ref">
        <div className="complete-success-icon" aria-hidden="true">
          <CheckCircleRounded />
        </div>

        <span className="complete-eyebrow">INTERVIEW FINISHED</span>
        <h1>Nice work. Your interview is complete.</h1>
        <p className="complete-description">
          Your practice session has been saved. Review your results to understand your answers,
          strengths, and areas to improve.
        </p>

        <div className="complete-stats complete-stats-ref">
          <div>
            <small>Role</small>
            <strong>{setup.role || 'Interview'}</strong>
          </div>
          <div>
            <small>Questions</small>
            <strong>{totalQuestions}</strong>
          </div>
          <div>
            <small>Answered</small>
            <strong>{answered}</strong>
          </div>
        </div>

        <div className="complete-actions complete-actions-ref">
          <button className="gradient-btn complete-primary-btn" type="button" onClick={() => navigate(ROUTES.INTERVIEW_RESULT)}>
            <InsightsRounded />
            <span>View interview results</span>
            <ArrowForwardRounded />
          </button>
          <button className="secondary-complete-btn" type="button" onClick={() => navigate(ROUTES.HOME)}>
            <HomeRounded />
            <span>Back home</span>
          </button>
        </div>

        <div className="complete-note">
          <span><CheckCircleRounded /></span>
          <div>
            <strong>Session saved</strong>
            <small>Your interview answers are ready for review.</small>
          </div>
        </div>
      </section>
    </main>
  )
}
