import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = resolve(__dirname, '..')

const read = (file) => readFile(resolve(ROOT, file), 'utf8')

const [indexHtml, routes, cosmic, home, vite, css] = await Promise.all([
  read('index.html'),
  read('src/routes/AppRoutes.jsx'),
  read('src/components/common/CosmicField.jsx'),
  read('src/pages/HomePage.jsx'),
  read('vite.config.js'),
  read('src/index.css'),
])

const checks = [
  ['Google Fonts uses preconnect', indexHtml.includes('rel="preconnect" href="https://fonts.googleapis.com"')],
  ['Google Fonts uses a stylesheet link', indexHtml.includes('fonts.googleapis.com/css2')],
  ['Google Fonts is not imported from CSS', !css.includes('@import url('https://fonts.googleapis.com')),
  ['Routes use React lazy loading', routes.includes("lazy(() => import('../pages/"))],
  ['Cosmic canvas pauses outside viewport', cosmic.includes('IntersectionObserver')],
  ['Cosmic canvas pauses when document is hidden', cosmic.includes('document.hidden')],
  ['Landing images have async decoding', home.includes('decoding="async"')],
  ['Below-fold testimonial images are lazy', home.includes('loading="lazy"')],
  ['Landing images reserve dimensions', home.includes('width="56" height="56"')],
  ['Offscreen sections use content visibility', css.includes('content-visibility: auto')],
  ['Vite uses production ES2022 target', vite.includes("target: 'es2022'")],
  ['Vite keeps CSS code splitting enabled', vite.includes('cssCodeSplit: true')],
]

const failures = checks.filter(([, passed]) => !passed)

if (failures.length) {
  console.error('Performance validation failed:')
  for (const [name] of failures) console.error(`- ${name}`)
  process.exit(1)
}

console.log(`Performance validation passed: ${checks.length} optimization guardrails verified.`)
