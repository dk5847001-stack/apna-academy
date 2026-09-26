/** Public SEO policy for the Interview application. */
import { ROUTES } from '../routes/routes'
import { getInterviewSeoContent } from '../data/interviewSeoContent'
import { getInterviewTopicFromPath } from './urlArchitecture'

export const INDEXABLE_ROUTES = new Set([ROUTES.HOME, ROUTES.INTERVIEW_QUESTIONS])

export const isIndexableRoute = (path) => {
  if (INDEXABLE_ROUTES.has(path)) return true
  const topic = getInterviewTopicFromPath(path)
  return Boolean(topic && getInterviewSeoContent(topic))
}

export const getRobotsContent = (path) =>
  isIndexableRoute(path) ? 'index, follow' : 'noindex, nofollow'