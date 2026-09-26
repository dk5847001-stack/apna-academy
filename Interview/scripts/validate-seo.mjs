import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getInterviewSeoTopics } from '../src/data/interviewSeoContent.js'
import { getInterviewQuestionsUrl } from '../src/seo/urlArchitecture.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const PUBLIC_DIR = resolve(__dirname, '../public')
const SITE_ORIGIN = (process.env.VITE_INTERVIEW_URL || 'https://interview.apnaacademy.me').replace(/\/$/, '')

const sitemapPath = resolve(PUBLIC_DIR, 'sitemap.xml')
const robotsPath = resolve(PUBLIC_DIR, 'robots.txt')
const [sitemap, robots] = await Promise.all([
  readFile(sitemapPath, 'utf8'),
  readFile(robotsPath, 'utf8'),
])

const expectedPaths = [
  '/',
  getInterviewQuestionsUrl(),
  ...getInterviewSeoTopics().map((topic) => getInterviewQuestionsUrl(topic)),
]

const expectedUrls = expectedPaths.map((path) => `${SITE_ORIGIN}${path === '/' ? '/' : path}`)

const errors = []

if (!sitemap.includes('<urlset') || !sitemap.includes('</urlset>')) {
  errors.push('sitemap.xml does not contain a valid urlset root.')
}

if (!robots.includes(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`)) {
  errors.push('robots.txt does not point to the configured sitemap origin.')
}

for (const url of expectedUrls) {
  const occurrences = sitemap.split(`<loc>${url}</loc>`).length - 1
  if (occurrences !== 1) errors.push(`Expected exactly one sitemap entry for: ${url}`)
}

const disallowedSitemapPaths = [
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

for (const path of disallowedSitemapPaths) {
  if (sitemap.includes(`<loc>${SITE_ORIGIN}${path}</loc>`)) {
    errors.push(`Non-indexable route found in sitemap: ${path}`)
  }
}

const urlCount = (sitemap.match(/<url>/g) || []).length
if (urlCount !== expectedUrls.length) {
  errors.push(`Sitemap URL count mismatch: expected ${expectedUrls.length}, found ${urlCount}`)
}

if (errors.length) {
  console.error('SEO validation failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log(`SEO validation passed: ${urlCount} indexable URLs, no protected routes in sitemap.`)
