import { useEffect } from 'react'
import { useRouter } from './Router'
import { ROUTES, routeMeta } from './routes'
import { getRobotsContent } from '../seo/routePolicy'
import HomePage from '../pages/HomePage'
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

const getOrCreateMeta = (name) => {
  let element = document.querySelector(`meta[name="${name}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute('name', name)
    document.head.appendChild(element)
  }
  return element
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
    getOrCreateMeta('description').setAttribute('content', meta.description)
    getOrCreateMeta('robots').setAttribute('content', getRobotsContent(path))
  }, [meta, path])

  return <Page routePath={path} />
}
