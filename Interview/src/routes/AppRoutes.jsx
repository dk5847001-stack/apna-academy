import { useEffect } from 'react'
import { useRouter } from './Router'
import { ROUTES, routeMeta } from './routes'
import HomePage from '../pages/HomePage'
import RoutePlaceholder from '../pages/RoutePlaceholder'
import InterviewSetupPage from '../pages/InterviewSetupPage'
import InterviewPreparationPage from '../pages/InterviewPreparationPage'
import InterviewRoomPage from '../pages/InterviewRoomPage'
import InterviewCompletePage from '../pages/InterviewCompletePage'
import InterviewResultPage from '../pages/InterviewResultPage'
import InterviewHistoryPage from '../pages/InterviewHistoryPage'
import InterviewLoginPage from '../pages/InterviewLoginPage'

const pages = {
  [ROUTES.HOME]: HomePage,
  [ROUTES.LOGIN]: InterviewLoginPage,
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
  const Page = pages[path] || RoutePlaceholder
  const meta = routeMeta[path] || {
    title: 'Page Not Found | ApnaAcademy Interview AI',
    description: 'The requested ApnaAcademy Interview AI page could not be found.',
  }

  useEffect(() => {
    document.title = meta.title
    const description = document.querySelector('meta[name="description"]')
    if (description) description.setAttribute('content', meta.description)
  }, [meta])

  return <Page routePath={path} />
}
