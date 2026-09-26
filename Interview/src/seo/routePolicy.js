/**
 * SEO route policy for the Interview application.
 *
 * Phase 1 intentionally keeps the authenticated interview journey out of
 * search results. Public, content-rich SEO routes can be added here in later
 * phases without coupling crawl policy to page components.
 */

import { ROUTES } from '../routes/routes'

export const INDEXABLE_ROUTES = new Set([
  ROUTES.HOME,
])

export const isIndexableRoute = (path) => INDEXABLE_ROUTES.has(path)

export const getRobotsContent = (path) =>
  isIndexableRoute(path) ? 'index, follow' : 'noindex, nofollow'
