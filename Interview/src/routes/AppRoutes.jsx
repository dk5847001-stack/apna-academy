import { useEffect } from 'react'
import { useRouter } from './Router'
import { ROUTES, routeMeta } from './routes'
import HomePage from '../pages/HomePage'
import RoutePlaceholder from '../pages/RoutePlaceholder'

const pages = {
  [ROUTES.HOME]: HomePage,
  [ROUTES.LOGIN]: RoutePlaceholder,
  [ROUTES.INTERVIEW_SETUP]: RoutePlaceholder,
  [ROUTES.INTERVIEW_PREPARATION]: RoutePlaceholder,
  [ROUTES.INTERVIEW_ROOM]: RoutePlaceholder,
  [ROUTES.INTERVIEW_COMPLETE]: RoutePlaceholder,
  [ROUTES.INTERVIEW_RESULT]: RoutePlaceholder,
  [ROUTES.HISTORY]: RoutePlaceholder,
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
