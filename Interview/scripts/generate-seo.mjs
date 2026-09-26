import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getInterviewSeoTopics } from '../src/data/interviewSeoContent.js'
import { getInterviewQuestionsUrl } from '../src/seo/urlArchitecture.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const PUBLIC_DIR = resolve(__dirname, '../public')
const SITE_ORIGIN = (process.env.VITE_INTERVIEW_URL || 'https://interview.apnaacademy.me').replace(/\/$/, '')

const INDEXABLE_PATHS = [
  '/',
  getInterviewQuestionsUrl(),
  ...getInterviewSeoTopics().map((topic) => getInterviewQuestionsUrl(topic)),
]

const escapeXml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

const toAbsoluteUrl = (path) => `${SITE_ORIGIN}${path === '/' ? '/' : path}`

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${INDEXABLE_PATHS.map((path) => `  <url><loc>${escapeXml(toAbsoluteUrl(path))}</loc></url>`).join('\n')}
</urlset>
`

const robots = `# ApnaAcademy Interview AI — crawler policy
# Only public, content-rich routes are included in the sitemap.
# Authenticated interview/session routes are intentionally excluded from the sitemap.

User-agent: *
Allow: /

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`

await mkdir(PUBLIC_DIR, { recursive: true })
await writeFile(resolve(PUBLIC_DIR, 'sitemap.xml'), sitemap, 'utf8')
await writeFile(resolve(PUBLIC_DIR, 'robots.txt'), robots, 'utf8')

console.log(`Generated ${INDEXABLE_PATHS.length} indexable URLs.`)
console.log(`Sitemap: ${resolve(PUBLIC_DIR, 'sitemap.xml')}`)
console.log(`Robots: ${resolve(PUBLIC_DIR, 'robots.txt')}`)
