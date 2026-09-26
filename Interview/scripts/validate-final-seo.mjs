import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = resolve(__dirname, '..')
const read = (file) => readFile(resolve(ROOT, file), 'utf8')

const files = {
  index: await read('index.html'),
  robots: await read('public/robots.txt'),
  sitemap: await read('public/sitemap.xml'),
  package: await read('package.json'),
  config: await read('src/seo/seoConfig.js'),
  policy: await read('src/seo/routePolicy.js'),
  schema: await read('src/seo/structuredData.js'),
  routes: await read('src/routes/routes.js'),
  architecture: await read('src/seo/urlArchitecture.js'),
  content: await read('src/data/interviewSeoContent.js'),
  appRoutes: await read('src/routes/AppRoutes.jsx'),
  seo: await read('src/components/seo/SEO.jsx'),
}

const errors = []
const origin = 'https://interview.apnaacademy.me'
const protectedPaths = [
  '/login', '/signup', '/interview/setup', '/interview/preparation',
  '/interview/room', '/interview/complete', '/interview/result',
  '/interview/history', '/interview/demo',
]
const sitemapUrls = [...files.sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1])

const requiredIndexMeta = [
  'rel="canonical"',
  'property="og:title"',
  'property="og:description"',
  'property="og:url"',
  'property="og:image"',
  'name="twitter:card"',
  'name="twitter:title"',
  'name="twitter:description"',
  'name="twitter:image"',
]

for (const marker of requiredIndexMeta) {
  if (!files.index.includes(marker)) errors.push(`Missing root metadata: ${marker}`)
}

if (!files.index.includes('<html lang="en-IN">')) errors.push('Root document language is not en-IN.')
if (!files.robots.includes(`Sitemap: ${origin}/sitemap.xml`)) errors.push('robots.txt sitemap origin mismatch.')
if (!files.config.includes('VITE_INTERVIEW_URL')) errors.push('SEO origin is not environment-configurable.')
if (!files.config.includes("index, follow, max-image-preview:large")) errors.push('Indexable robots policy is missing expected directives.')
if (!files.policy.includes('getInterviewSeoContent')) errors.push('Indexability is not tied to curated content.')
if (!files.schema.includes('BreadcrumbList')) errors.push('BreadcrumbList structured data missing.')
if (!files.schema.includes('WebSite')) errors.push('WebSite structured data missing.')
if (!files.appRoutes.includes('<SEO path={path} />')) errors.push('SEO component is not mounted at route level.')
if (!files.seo.includes('applyStructuredData(config)')) errors.push('Structured data is not applied by SEO component.')
if (!files.architecture.includes('getInterviewSeoTopics')) errors.push('Topic URL architecture is not content-driven.')
const requiredBuildSteps = [
  'npm run seo:generate',
  'npm run seo:validate',
  'npm run performance:validate',
  'npm run seo:final',
  'vite build',
  'npm run seo:static',
  'npm run seo:static:validate',
]
for (const step of requiredBuildSteps) {
  if (!files.package.includes(step)) {
    errors.push(`Production build is missing validation step: ${step}`)
  }
}

for (const path of protectedPaths) {
  if (sitemapUrls.includes(origin + path)) errors.push(`Protected route is present in sitemap: ${path}`)
}

for (const url of sitemapUrls) {
  if (!url.startsWith(origin + '/')) errors.push(`Sitemap contains a URL outside the Interview origin: ${url}`)
}

if (sitemapUrls.length < 2) errors.push('Sitemap has fewer than two public URLs.')
if (new Set(sitemapUrls).size !== sitemapUrls.length) errors.push('Sitemap contains duplicate URLs.')

const topicSlugs = [...files.content.matchAll(/^\s{2}([a-z0-9-]+):\s*\{/gm)].map((match) => match[1])
for (const slug of topicSlugs) {
  const url = `${origin}/interview-questions/${slug}`
  if (!sitemapUrls.includes(url)) errors.push(`Content topic missing from sitemap: ${slug}`)
}

if (errors.length) {
  console.error('Final SEO validation failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log(`Final SEO validation passed: ${sitemapUrls.length} sitemap URLs, protected routes excluded, root metadata present, static SEO build stage configured.`)
