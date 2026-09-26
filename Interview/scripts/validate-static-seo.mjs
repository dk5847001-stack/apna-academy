import { access, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getInterviewSeoContent, getInterviewSeoTopics } from '../src/data/interviewSeoContent.js'
import { getInterviewQuestionsUrl } from '../src/seo/urlArchitecture.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = resolve(__dirname, '..')
const DIST = resolve(ROOT, 'dist')
const ORIGIN = (process.env.VITE_INTERVIEW_URL || 'https://interview.apnaacademy.me').replace(/\/$/, '')
const errors = []

const publicPages = [
  { path: '/', title: 'AI Interview Practice Online | ApnaAcademy Interview AI' },
  { path: '/interview-questions', title: 'Interview Questions & AI Practice | ApnaAcademy' },
  ...getInterviewSeoTopics().map((slug) => {
    const topic = getInterviewSeoContent(slug)
    return { path: getInterviewQuestionsUrl(slug), title: `${topic.title} | ApnaAcademy` }
  }),
]

const protectedPages = [
  '/login',
  '/signup',
  '/interview/setup',
  '/interview/preparation',
  '/interview/room',
  '/interview/complete',
  '/interview/result',
  '/interview/history',
  '/interview/demo',
]

const fileFor = (path) => resolve(DIST, path === '/' ? 'index.html' : `${path.slice(1)}/index.html`)

const readRoute = async (path) => {
  const file = fileFor(path)
  try {
    await access(file)
    return await readFile(file, 'utf8')
  } catch {
    errors.push(`Missing prerendered HTML: ${path}`)
    return ''
  }
}

for (const page of publicPages) {
  const html = await readRoute(page.path)
  if (!html) continue
  const canonical = `${ORIGIN}${page.path === '/' ? '/' : page.path}`
  if (!html.includes(`<title>${page.title}</title>`)) errors.push(`Wrong/missing title: ${page.path}`)
  if (!html.includes(`<link rel="canonical" href="${canonical}"`)) errors.push(`Wrong/missing canonical: ${page.path}`)
  if (!html.includes('name="robots" content="index, follow')) errors.push(`Public route is not indexable in static HTML: ${page.path}`)
  if (!html.includes('application/ld+json')) errors.push(`Missing JSON-LD: ${page.path}`)
}

for (const path of protectedPages) {
  const html = await readRoute(path)
  if (!html) continue
  if (!html.includes('name="robots" content="noindex, nofollow')) errors.push(`Protected route is not noindex in static HTML: ${path}`)
  if (html.includes('application/ld+json')) errors.push(`Protected route contains public JSON-LD: ${path}`)
}

if (errors.length) {
  console.error('Static SEO validation failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log(`Static SEO validation passed: ${publicPages.length} public prerendered routes and ${protectedPages.length} protected routes verified.`)
