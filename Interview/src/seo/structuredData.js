import { ROUTES } from '../routes/routes'
import { getInterviewTopicFromPath } from './urlArchitecture'
import { getInterviewSeoContent } from '../data/interviewSeoContent'
import { SEO_ORIGIN, getCanonicalUrl } from './seoConfig'

const SCHEMA_ID = 'apna-interview-seo-jsonld'
const toAbsoluteUrl = (path) => getCanonicalUrl(path)

const createOrganization = () => ({
  '@type': 'Organization',
  '@id': SEO_ORIGIN + '/#organization',
  name: 'ApnaAcademy',
  url: 'https://apnaacademy.me/',
  logo: 'https://interview.apnaacademy.me/favicon.png',
})

const createWebSite = () => ({
  '@type': 'WebSite',
  '@id': SEO_ORIGIN + '/#website',
  url: SEO_ORIGIN + '/',
  name: 'ApnaAcademy Interview AI',
  publisher: { '@id': SEO_ORIGIN + '/#organization' },
  inLanguage: 'en-IN',
})

const createWebPage = (config) => ({
  '@type': 'WebPage',
  '@id': config.canonical + '#webpage',
  url: config.canonical,
  name: config.title,
  description: config.description,
  isPartOf: { '@id': SEO_ORIGIN + '/#website' },
  about: { '@id': SEO_ORIGIN + '/#organization' },
  inLanguage: config.language,
})

const createBreadcrumbs = (path, config, topicContent) => {
  const items = [{ name: 'Home', item: toAbsoluteUrl(ROUTES.HOME) }]
  if (path !== ROUTES.HOME) items.push({ name: 'Interview Questions', item: toAbsoluteUrl(ROUTES.INTERVIEW_QUESTIONS) })
  if (topicContent) items.push({ name: topicContent.shortTitle, item: config.canonical })
  return {
    '@type': 'BreadcrumbList',
    '@id': config.canonical + '#breadcrumb',
    itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: item.item })),
  }
}

const createFaqPage = (config, faqs) => ({
  '@type': 'FAQPage',
  '@id': config.canonical + '#faq',
  mainEntity: faqs.map(([question, answer]) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
})

const createQuestionCollection = (config, topicContent) => ({
  '@type': 'ItemList',
  '@id': config.canonical + '#questions',
  name: topicContent.shortTitle + ' Interview Questions',
  numberOfItems: topicContent.questions.length,
  itemListElement: topicContent.questions.map(([category, question], index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: question,
    description: category,
  })),
})

export function getStructuredData(config) {
  if (!config?.indexable) return null
  const path = config.path
  const topic = getInterviewTopicFromPath(path)
  const topicContent = topic ? getInterviewSeoContent(topic) : null
  const graph = [createOrganization(), createWebSite(), createWebPage(config), createBreadcrumbs(path, config, topicContent)]
  if (topicContent) {
    graph.push(createQuestionCollection(config, topicContent))
    if (topicContent.faqs?.length) graph.push(createFaqPage(config, topicContent.faqs))
  }
  return { '@context': 'https://schema.org', '@graph': graph }
}

export function applyStructuredData(config) {
  document.getElementById(SCHEMA_ID)?.remove()
  const structuredData = getStructuredData(config)
  if (!structuredData) return
  const script = document.createElement('script')
  script.id = SCHEMA_ID
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(structuredData)
  document.head.appendChild(script)
}

export function removeStructuredData() {
  document.getElementById(SCHEMA_ID)?.remove()
}