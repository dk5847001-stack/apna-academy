import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getInterviewSeoContent, getInterviewSeoTopics } from '../src/data/interviewSeoContent.js'
import { getInterviewQuestionsUrl } from '../src/seo/urlArchitecture.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = resolve(__dirname, '..')
const DIST_DIR = resolve(ROOT, 'dist')
const SITE_ORIGIN = (process.env.VITE_INTERVIEW_URL || 'https://interview.apnaacademy.me').replace(/\/$/, '')

const HOME = {
  path: '/',
  title: 'AI Interview Practice Online | ApnaAcademy Interview AI',
  description: 'Practice realistic AI interviews with role-specific questions, instant feedback and structured preparation for your next interview.',
  type: 'website',
}
const HUB = {
  path: '/interview-questions',
  title: 'Interview Questions & AI Practice | ApnaAcademy',
  description: 'Explore structured interview questions, preparation resources and AI-powered practice by role, technology and interview type.',
  type: 'website',
}
const PROTECTED = [
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

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const absolute = (path) => `${SITE_ORIGIN}${path === '/' ? '/' : path}`

const createMeta = ({ path, title, description, type = 'website', indexable = true }) => {
  const canonical = absolute(path)
  const robots = indexable
    ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    : 'noindex, nofollow, noarchive, nosnippet'
  return {
    canonical,
    head: `
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="${robots}" />
    <meta name="googlebot" content="${indexable ? 'index, follow' : 'noindex, nofollow'}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:site_name" content="ApnaAcademy Interview AI" />
    <meta property="og:locale" content="en_IN" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${SITE_ORIGIN}/favicon.png" />
    <meta property="og:image:alt" content="ApnaAcademy Interview AI" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${SITE_ORIGIN}/favicon.png" />
    <title>${escapeHtml(title)}</title>`,
  }
}

const organization = {
  '@type': 'Organization',
  '@id': `${SITE_ORIGIN}/#organization`,
  name: 'ApnaAcademy',
  url: 'https://apnaacademy.me/',
  logo: '${SITE_ORIGIN}/favicon.png',
}

const buildSchema = ({ path, title, description, type, topic }) => {
  const canonical = absolute(path)
  const graph = [
    organization,
    {
      '@type': 'WebSite',
      '@id': `${SITE_ORIGIN}/#website`,
      url: `${SITE_ORIGIN}/`,
      name: 'ApnaAcademy Interview AI',
      publisher: { '@id': `${SITE_ORIGIN}/#organization` },
      inLanguage: 'en-IN',
    },
    {
      '@type': 'WebPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: title,
      description,
      isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
      about: { '@id': `${SITE_ORIGIN}/#organization` },
      inLanguage: 'en-IN',
    },
  ]

  const breadcrumb = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: absolute('/') },
  ]
  if (path !== '/') {
    breadcrumb.push({ '@type': 'ListItem', position: 2, name: 'Interview Questions', item: absolute('/interview-questions') })
  }
  if (topic) {
    breadcrumb.push({ '@type': 'ListItem', position: 3, name: topic.shortTitle, item: canonical })
  }
  graph.push({
    '@type': 'BreadcrumbList',
    '@id': `${canonical}#breadcrumb`,
    itemListElement: breadcrumb,
  })

  if (topic) {
    graph.push({
      '@type': 'ItemList',
      '@id': `${canonical}#questions`,
      name: `${topic.shortTitle} Interview Questions`,
      numberOfItems: topic.questions.length,
      itemListElement: topic.questions.map(([category, question], index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: question,
        description: category,
      })),
    })
    if (topic.faqs?.length) {
      graph.push({
        '@type': 'FAQPage',
        '@id': `${canonical}#faq`,
        mainEntity: topic.faqs.map(([question, answer]) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      })
    }
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}

const renderPage = (template, page) => {
  const meta = createMeta(page)
  const schema = page.indexable === false ? '' : `<script id="apna-interview-seo-jsonld" type="application/ld+json">${JSON.stringify(buildSchema(page)).replace(/</g, '\\u003c')}</script>`
  return template
    .replace(/<meta name="description"[^>]*>\s*/i, '')
    .replace(/<meta name="robots"[^>]*>\s*/i, '')
    .replace(/<link rel="canonical"[^>]*>\s*/i, '')
    .replace(/<meta property="og:[^>]*>\s*/gi, '')
    .replace(/<meta name="twitter:[^>]*>\s*/gi, '')
    .replace(/<title>[^<]*<\/title>/i, '')
    .replace('</head>', `${meta.head}\n    ${schema}\n  </head>`)
}

const writeRoute = async (template, page) => {
  const route = page.path === '/' ? 'index.html' : `${page.path.slice(1)}/index.html`
  const output = resolve(DIST_DIR, route)
  await mkdir(dirname(output), { recursive: true })
  await writeFile(output, renderPage(template, page), 'utf8')
}

const template = await readFile(resolve(DIST_DIR, 'index.html'), 'utf8')
const publicPages = [HOME, HUB]

for (const topicSlug of getInterviewSeoTopics()) {
  const topic = getInterviewSeoContent(topicSlug)
  const path = getInterviewQuestionsUrl(topicSlug)
  publicPages.push({
    path,
    title: `${topic.title} | ApnaAcademy`,
    description: topic.description,
    type: 'article',
    topic,
  })
}

for (const page of publicPages) await writeRoute(template, { ...page, indexable: true })

for (const path of PROTECTED) {
  const titleMap = {
    '/login': 'Login | ApnaAcademy Interview AI',
    '/signup': 'Create Account | ApnaAcademy Interview AI',
    '/interview/setup': 'Interview Setup | ApnaAcademy Interview AI',
    '/interview/preparation': 'Interview Preparation | ApnaAcademy Interview AI',
    '/interview/room': 'Live AI Interview | ApnaAcademy Interview AI',
    '/interview/complete': 'Interview Complete | ApnaAcademy Interview AI',
    '/interview/result': 'Interview Results | ApnaAcademy Interview AI',
    '/interview/history': 'Interview History | ApnaAcademy Interview AI',
    '/interview/demo': 'AI Interview Demo | ApnaAcademy Interview AI',
  }
  await writeRoute(template, {
    path,
    title: titleMap[path],
    description: 'ApnaAcademy Interview AI application page.',
    indexable: false,
  })
}

console.log(`Generated static SEO HTML for ${publicPages.length} public routes and ${PROTECTED.length} protected routes.`)
