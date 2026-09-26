import { ROUTES } from '../routes/routes'

export const SEO_URLS = {
  INTERVIEW_QUESTIONS: ROUTES.INTERVIEW_QUESTIONS,
  INTERVIEW_QUESTIONS_TOPIC: '/interview-questions/:topic',
}

export const INTERVIEW_TOPICS = [
  'software-engineer',
  'frontend-developer',
  'backend-developer',
  'full-stack-developer',
  'react',
  'javascript',
  'nodejs',
  'java',
  'python',
  'dsa',
  'behavioral',
  'hr',
]

const TOPIC_PATTERN = /^\/interview-questions\/([a-z0-9]+(?:-[a-z0-9]+)*)$/

export function slugify(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function unslugify(value = '') {
  return String(value)
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function getInterviewTopicFromPath(pathname = '') {
  const match = String(pathname).match(TOPIC_PATTERN)
  return match ? decodeURIComponent(match[1]) : null
}

export function isInterviewQuestionsPath(pathname = '') {
  return pathname === ROUTES.INTERVIEW_QUESTIONS || Boolean(getInterviewTopicFromPath(pathname))
}

export function getInterviewQuestionsUrl(topic = '') {
  const slug = slugify(topic)
  return slug ? `${ROUTES.INTERVIEW_QUESTIONS}/${slug}` : ROUTES.INTERVIEW_QUESTIONS
}

export function getInterviewTopicLabel(slug = '') {
  return unslugify(slug)
}
