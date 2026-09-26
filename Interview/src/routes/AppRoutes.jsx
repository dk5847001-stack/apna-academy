import { lazy, Suspense } from 'react'
import SEO from '../components/seo/SEO'
import { useRouter } from './Router'
import { ROUTES } from './routes'
import { isInterviewQuestionsPath } from '../seo/urlArchitecture'

const HomePage = lazy(() => import('../pages/HomePage'))
const InterviewQuestionsPage = lazy(() => import('../pages/InterviewQuestionsPage'))
const RoutePlaceholder = lazy(() => import('../pages/RoutePlaceholder'))
const InterviewSetupPage = lazy(() => import('../pages/InterviewSetupPage'))
const InterviewPreparationPage = lazy(() => import('../pages/InterviewPreparationPage'))
const InterviewRoomPage = lazy(() => import('../pages/InterviewRoomPage'))
const InterviewCompletePage = lazy(() => import('../pages/InterviewCompletePage'))
const InterviewResultPage = lazy(() => import('../pages/InterviewResultPage'))
const InterviewHistoryPage = lazy(() => import('../pages/InterviewHistoryPage'))
const InterviewLoginPage = lazy(() => import('../pages/InterviewLoginPage'))
const InterviewSignupPage = lazy(() => import('../pages/InterviewSignupPage'))

const pages = {
  [ROUTES.HOME]: HomePage,
  [ROUTES.INTERVIEW_QUESTIONS]: InterviewQuestionsPage,
  [ROUTES.LOGIN]: InterviewLoginPage,
  [ROUTES.SIGNUP]: InterviewSignupPage,
  [ROUTES.INTERVIEW_SETUP]: InterviewSetupPage,
  [ROUTES.INTERVIEW_PREPARATION]: InterviewPreparationPage,
  [ROUTES.INTERVIEW_ROOM]: InterviewRoomPage,
  [ROUTES.INTERVIEW_COMPLETE]: InterviewCompletePage,
  [ROUTES.INTERVIEW_RESULT]: InterviewResultPage,
  [ROUTES.HISTORY]: InterviewHistoryPage,
  [ROUTES.DEMO]: RoutePlaceholder,
}

function RouteFallback() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <span className="route-loading-dot" />
      <span>Loading experience…</span>
    </div>
  )
}

export default function AppRoutes() {
  const { path } = useRouter()
  const Page = pages[path] || (isInterviewQuestionsPath(path) ? InterviewQuestionsPage : RoutePlaceholder)

  return (
    <>
      <SEO path={path} />
      <Suspense fallback={<RouteFallback />}>
        <Page routePath={path} />
      </Suspense>
    </>
  )
}
