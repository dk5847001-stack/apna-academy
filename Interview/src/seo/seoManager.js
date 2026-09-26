const MANAGED_SELECTOR = '[data-apna-interview-seo="true"]'

function upsertMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${CSS.escape(key)}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    element.dataset.apnaInterviewSeo = 'true'
    document.head.appendChild(element)
  }
  element.setAttribute('content', content || '')
}

function upsertLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`)
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    element.dataset.apnaInterviewSeo = 'true'
    document.head.appendChild(element)
  }
  element.setAttribute('href', href)
}

function removeManagedMeta(attribute, key) {
  document.head
    .querySelectorAll(`meta[${attribute}="${CSS.escape(key)}"]${MANAGED_SELECTOR}`)
    .forEach((element) => element.remove())
}

export function applySeo(config) {
  document.documentElement.lang = config.language
  document.title = config.title

  upsertMeta('name', 'description', config.description)
  upsertMeta('name', 'robots', config.robots)
  upsertMeta('name', 'googlebot', config.googlebot)
  upsertMeta('name', 'keywords', config.keywords || '')
  upsertMeta('name', 'theme-color', '#ffffff')

  upsertMeta('property', 'og:type', config.type)
  upsertMeta('property', 'og:title', config.title)
  upsertMeta('property', 'og:description', config.description)
  upsertMeta('property', 'og:url', config.canonical)
  upsertMeta('property', 'og:site_name', config.siteName)
  upsertMeta('property', 'og:locale', config.locale)
  upsertMeta('property', 'og:image', config.image)
  upsertMeta('property', 'og:image:alt', config.imageAlt)
  upsertMeta('property', 'og:image:type', 'image/png')

  upsertMeta('name', 'twitter:card', config.twitterCard)
  upsertMeta('name', 'twitter:title', config.title)
  upsertMeta('name', 'twitter:description', config.description)
  upsertMeta('name', 'twitter:image', config.image)
  upsertMeta('name', 'twitter:image:alt', config.imageAlt)

  upsertLink('canonical', config.canonical)

  // Avoid stale optional keywords from previous route configurations.
  if (!config.keywords) removeManagedMeta('name', 'keywords')
}

export function resetSeoToDocumentDefaults() {
  document.querySelectorAll(MANAGED_SELECTOR).forEach((element) => element.remove())
}
