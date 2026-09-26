import SEO from '../components/seo/SEO'
import { useRouter } from './Router'
import { ROUTES } from './routes'
import { isInterviewQuestionsPath } from '../seo/urlArchitecture'
import HomePage from '../pages/HomePage'
import InterviewQuestionsPage from '../pages/InterviewQuestionsPage'
import RoutePlaceholder from '../pages/RoutePlaceholder'
import InterviewSetupPage from '../pages/InterviewSetupPage'
import InterviewPreparationPage from '../pages/InterviewPreparationPage'
import InterviewRoomPage from '../pages/InterviewRoomPage'
import InterviewCompletePage from '../pages/InterviewCompletePage'
import InterviewResultPage from '../pages/InterviewResultPage'
import InterviewHistoryPage from '../pages/InterviewHistoryPage'
import InterviewLoginPage from '../pages/InterviewLoginPage'
import InterviewSignupPage from '../pages/InterviewSignupPage'

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

export default function AppRoutes() {
  const { path } = useRouter()
  const Page = pages[path] || (isInterviewQuestionsPath(path) ? InterviewQuestionsPage : RoutePlaceholder)

  return (
    <>
      <SEO path={path} />
      <Page routePath={path} />
    </>
  )
}
