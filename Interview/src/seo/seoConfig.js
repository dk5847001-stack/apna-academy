import { ROUTES } from '../routes/routes'
import { isIndexableRoute } from './routePolicy'
import { getInterviewTopicFromPath, getInterviewTopicLabel, isInterviewQuestionsPath } from './urlArchitecture'

export const SEO_ORIGIN = (
  import.meta.env.VITE_INTERVIEW_URL || 'https://interview.apnaacademy.me'
).replace(/\/$/, '')

export const SEO_DEFAULTS = {
  siteName: 'ApnaAcademy Interview AI',
  titleSuffix: ' | ApnaAcademy Interview AI',
  defaultTitle: 'AI Interview Practice Online | ApnaAcademy Interview AI',
  defaultDescription:
    'Practice realistic AI interviews, answer role-specific questions and get structured feedback to improve your interview performance.',
  locale: 'en_IN',
  language: 'en-IN',
  type: 'website',
  image: 'https://apnaacademy.me/favicon.png',
  imageAlt: 'ApnaAcademy Interview AI',
}

const ROUTE_SEO = {
  [ROUTES.HOME]: {
    title: 'AI Interview Practice Online | ApnaAcademy Interview AI',
    description:
      'Practice realistic AI interviews with role-specific questions, instant feedback and structured preparation for your next interview.',
    keywords:
      'AI interview practice, mock interview, interview preparation, AI interviewer, interview questions',
    type: 'website',
  },
  [ROUTES.DEMO]: {
    title: 'AI Interview Demo | ApnaAcademy Interview AI',
    description:
      'Preview the ApnaAcademy AI interview experience and see how realistic interview practice can help you prepare.',
    keywords: 'AI interview demo, mock interview demo, interview practice',
    type: 'website',
  },
  [ROUTES.LOGIN]: {
    title: 'Login | ApnaAcademy Interview AI',
    description: 'Sign in to continue your ApnaAcademy Interview AI practice.',
  },
  [ROUTES.SIGNUP]: {
    title: 'Create Account | ApnaAcademy Interview AI',
    description: 'Create your ApnaAcademy Interview AI account and start practicing.',
  },
  [ROUTES.INTERVIEW_SETUP]: {
    title: 'Interview Setup | ApnaAcademy Interview AI',
    description: 'Configure your role, experience, interview type and difficulty.',
  },
  [ROUTES.INTERVIEW_PREPARATION]: {
    title: 'Interview Preparation | ApnaAcademy Interview AI',
    description: 'Prepare your interview environment and review your interview configuration.',
  },
  [ROUTES.INTERVIEW_ROOM]: {
    title: 'Live AI Interview | ApnaAcademy Interview AI',
    description: 'Practice in a focused AI-powered interview session.',
  },
  [ROUTES.INTERVIEW_COMPLETE]: {
    title: 'Interview Complete | ApnaAcademy Interview AI',
    description: 'Your AI interview session has been completed.',
  },
  [ROUTES.INTERVIEW_RESULT]: {
    title: 'Interview Results | ApnaAcademy Interview AI',
    description: 'Review your interview performance, strengths and improvement areas.',
  },
  [ROUTES.HISTORY]: {
    title: 'Interview History | ApnaAcademy Interview AI',
    description: 'Review your previous AI interview sessions and reports.',
  },
}

const NOT_FOUND_SEO = {
  title: 'Page Not Found | ApnaAcademy Interview AI',
  description: 'The requested ApnaAcademy Interview AI page could not be found.',
}

export function normalizePath(pathname = '/') {
  if (!pathname || pathname === '/') return '/'
  const withoutQuery = pathname.split(/[?#]/)[0]
  const normalized = withoutQuery.replace(/\/+$/, '')
  return normalized || '/'
}

export function getCanonicalUrl(pathname = '/') {
  const path = normalizePath(pathname)
  return path === '/' ? `${SEO_ORIGIN}/` : `${SEO_ORIGIN}${path}`
}

export function getSeoConfig(pathname = '/') {
  const path = normalizePath(pathname)
  const topic = getInterviewTopicFromPath(path)
  const topicLabel = topic ? getInterviewTopicLabel(topic) : ''
  const interviewQuestionsPage = path === '/interview-questions'
  const dynamicPage = isInterviewQuestionsPath(path)
    ? interviewQuestionsPage
      ? {
          title: 'Interview Questions & AI Practice | ApnaAcademy',
          description:
            'Explore structured interview questions, preparation resources and AI-powered practice by role, technology and interview type.',
          keywords: 'interview questions, mock interview questions, AI interview practice, interview preparation',
          type: 'website',
        }
      : {
          title: `${topicLabel} Interview Questions | ApnaAcademy`,
          description: `Practice ${topicLabel.toLowerCase()} interview questions with structured preparation resources and AI-powered interview practice.`,
          keywords: `${topicLabel.toLowerCase()} interview questions, ${topicLabel.toLowerCase()} interview preparation, mock interview`,
          type: 'website',
        }
    : null
  const page = ROUTE_SEO[path] || dynamicPage || NOT_FOUND_SEO
  const knownRoute = Boolean(ROUTE_SEO[path] || dynamicPage)
  const indexable = knownRoute && isIndexableRoute(path)

  return {
    ...SEO_DEFAULTS,
    ...page,
    path,
    canonical: getCanonicalUrl(path),
    indexable,
    robots: indexable
      ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      : 'noindex, nofollow, noarchive, nosnippet',
    googlebot: indexable ? 'index, follow' : 'noindex, nofollow',
    twitterCard: 'summary_large_image',
  }
}
