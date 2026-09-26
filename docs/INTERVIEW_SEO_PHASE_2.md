# Interview SEO — Phase 2

## Dynamic SEO engine

Phase 2 centralizes page-level SEO metadata for the Interview React application.

### Architecture

route -> SEO component -> SEO config -> SEO manager -> document head

### Managed metadata

The SEO engine updates on client-side route changes:

- title
- meta description
- robots
- googlebot
- canonical URL
- Open Graph title/description/type/site name/locale/url/image
- Twitter card/title/description/image
- document language
- theme color

### Canonical policy

The production canonical origin is:

https://interview.apnaacademy.me

It can be overridden with VITE_INTERVIEW_URL.

Trailing slashes are normalized so equivalent application paths do not generate
different canonical URLs.

### Indexability

The SEO engine consumes the Phase 1 route policy. A route is indexable only
when it is explicitly present in the public indexable route set.

Private/session routes remain noindex, nofollow while the public homepage remains
index, follow.

### Social metadata

The engine provides a consistent Open Graph and Twitter representation. The
current social image uses the existing ApnaAcademy production favicon asset.

### Important boundary

This phase provides a strong client-side metadata architecture. It does not
claim server-side rendering or guaranteed Google indexing. Search-focused
landing pages, dynamic content, structured data, automated sitemap generation
and prerender/static SEO output remain separate phases.

## Files

- Interview/src/seo/seoConfig.js
- Interview/src/seo/seoManager.js
- Interview/src/components/seo/SEO.jsx
- Interview/src/routes/AppRoutes.jsx
- Interview/src/routes/routes.js
- Interview/index.html
- Interview/.env.example
