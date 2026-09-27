import {
  AutoAwesome,
  ArrowForward,
  CheckCircleRounded,
  LockRounded,
} from '@mui/icons-material'
import { ROUTES } from '../routes/routes'
import { useRouter } from '../routes/Router'
import CosmicField from '../components/common/CosmicField'

const content = {
  [ROUTES.LOGIN]: {
    eyebrow: 'Account access',
    title: 'Your Interview AI workspace starts here.',
    body: 'Authentication UI is intentionally isolated from the landing architecture and will be completed in the dedicated interview flow phase.',
    action: 'Back to Home',
    target: ROUTES.HOME,
  },
  [ROUTES.INTERVIEW_SETUP]: {
    eyebrow: 'Interview setup',
    title: 'Configure your AI interview.',
    body: 'Role, experience, interview type, difficulty, duration and question count will live here in Phase 3.',
    action: 'Continue',
    target: ROUTES.INTERVIEW_PREPARATION,
  },
  [ROUTES.INTERVIEW_PREPARATION]: {
    eyebrow: 'Preparation',
    title: 'Get ready before the interview begins.',
    body: 'Microphone, camera, instructions and final configuration checks will be implemented in the preparation phase.',
    action: 'Enter Interview Room',
    target: ROUTES.INTERVIEW_ROOM,
  },
  [ROUTES.INTERVIEW_ROOM]: {
    eyebrow: 'Live interview',
    title: 'AI Interview Room',
    body: 'The focused interview workspace, timer, questions, answer capture and AI interaction will be implemented in Phase 4.',
    action: 'Complete Demo',
    target: ROUTES.INTERVIEW_COMPLETE,
  },
  [ROUTES.INTERVIEW_COMPLETE]: {
    eyebrow: 'Interview complete',
    title: 'Your interview session is complete.',
    body: 'Completion state and submission handling are wired as a route now; detailed result processing arrives in the result phase.',
    action: 'View Results',
    target: ROUTES.INTERVIEW_RESULT,
  },
  [ROUTES.INTERVIEW_RESULT]: {
    eyebrow: 'Performance report',
    title: 'Your interview report will appear here.',
    body: 'Score breakdown, strengths, improvement areas and recommendations will be implemented in Phase 6.',
    action: 'View History',
    target: ROUTES.HISTORY,
  },
  [ROUTES.HISTORY]: {
    eyebrow: 'Interview history',
    title: 'Your interview history.',
    body: 'Past sessions, reports and progress insights will be implemented in the student experience phase.',
    action: 'Back to Home',
    target: ROUTES.HOME,
  },
  [ROUTES.DEMO]: {
    eyebrow: 'AI interview demo',
    title: 'Experience the interview flow.',
    body: 'The demo route is ready for the interactive interview preview that will be built with the interview room.',
    action: 'Start Practice',
    target: ROUTES.INTERVIEW_SETUP,
  },
}

export default function RoutePlaceholder({ routePath }) {
  const { navigate } = useRouter()
  const page = content[routePath] || {
    eyebrow: '404',
    title: 'Page not found.',
    body: 'The page you requested does not exist in ApnaAcademy Interview AI.',
    action: 'Return Home',
    target: ROUTES.HOME,
  }

  return (
    <main className="min-h-[70vh] px-4 py-16 sm:px-6 lg:px-8 demo-placeholder-page"><CosmicField density="hero" /><div className="demo-cosmic-orb" aria-hidden="true" /><div className="demo-cosmic-orb-two" aria-hidden="true" />
      <section className="demo-placeholder-shell">
        <div className="demo-placeholder-card"><div className="demo-placeholder-content">
          <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(108,66,255,0.13),transparent_45%)]" />
          <div className="relative z-10 mx-auto max-w-2xl">
            <span className="demo-placeholder-eyebrow"><AutoAwesome fontSize="small" /> {page.eyebrow}</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">{page.title}</h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">{page.body}</p>
            <div className="demo-placeholder-actions">
              <button className="gradient-btn" onClick={() => navigate(page.target)}>
                {page.action} <ArrowForward />
              </button>
              <span className="demo-placeholder-status">
                <CheckCircleRounded fontSize="small" /> Route ready
              </span>
            </div>
            <div className="demo-placeholder-features">
              {['Reusable components', 'Central route map', 'Mock service boundary'].map((item) => (
                <div key={item} className="demo-placeholder-feature">
                  <LockRounded className="mb-2 text-violet-600" fontSize="small" />
                  <p>{item}</p><small>Ready for the interactive interview experience.</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
