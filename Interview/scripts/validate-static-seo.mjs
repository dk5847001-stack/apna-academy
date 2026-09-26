import { access, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = resolve(__dirname, '..')
const DIST = resolve(ROOT, 'dist')
const errors = []
const origin = 'https://interview.apnaacademy.me'

const publicRoutes = ['/', '/interview-questions', '/interview-questions/software-engineer', '/interview-questions/frontend-developer', '/interview-questions/backend-developer', '/interview-questions/full-stack-developer', '/interview-questions/react', '/interview-questions/javascript', '/interview-questions/nodejs', '/interview-questions/java', '/interview-questions/python', '/interview-questions/dsa', '/interview-questions/behavioral', '/interview-questions/hr']
const protectedRoutes = ['/login', '/signup', '/interview/setup', '/interview/preparation', '/interview/room', '/interview/complete', '/interview/result', '/interview/history', '/interview/demo']
const routeFile = (route) => resolve(DIST, route === '/' ? 'index.html' : `${route.slice(1)}/index.html`)
const readRoute = async (route) => readFile(routeFile(route), 'utf8')
const has = (html, value) => html.includes(value)

for (const route of publicRoutes) {
  try {
    const html = await readRoute(route)
    const canonical = `${origin}${route === '/' ? '/' : route}`
    if (!has(html, 'name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"')) errors.push(`Public route missing indexable robots: ${route}`)
    if (!has(html, `<link rel="canonical" href="${canonical}"`)) errors.push(`Public route canonical mismatch: ${route}`)
    if (!has(html, 'id="apna-interview-seo-jsonld"')) errors.push(`Public route missing JSON-LD: ${route}`)
    if (!has(html, '<link rel="icon" type="image/png" href="/favicon.png"')) errors.push(`Public route missing favicon reference: ${route}`)
    if (!has(html, 'https://interview.apnaacademy.me/favicon.png')) errors.push(`Public route missing absolute favicon/social image reference: ${route}`)
  } catch { errors.push(`Missing prerendered public route: ${route}`) }
}

for (const route of protectedRoutes) {
  try {
    const html = await readRoute(route)
    if (!has(html, 'noindex, nofollow, noarchive, nosnippet')) errors.push(`Protected route missing noindex policy: ${route}`)
    if (has(html, 'id="apna-interview-seo-jsonld"')) errors.push(`Protected route contains public JSON-LD: ${route}`)
  } catch { errors.push(`Missing prerendered protected route: ${route}`) }
}

try { await access(resolve(DIST, 'favicon.png')) } catch { errors.push('dist/favicon.png is missing.') }
const root = await readRoute('/')
if (!has(root, '<title>AI Interview Practice Online | ApnaAcademy Interview AI</title>')) errors.push('Root static title mismatch.')
if (!has(root, 'https://interview.apnaacademy.me/favicon.png')) errors.push('Root static favicon/social image URL mismatch.')

if (errors.length) {
  console.error('Static SEO validation failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}
console.log(`Static SEO validation passed: ${publicRoutes.length} public routes, ${protectedRoutes.length} protected routes, favicon present.`)