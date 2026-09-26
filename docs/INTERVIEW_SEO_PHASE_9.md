# ApnaAcademy Interview AI — SEO Phase 9

## Goal

Phase 9 upgrades the Interview application from runtime-only SPA SEO to a production build that also emits route-specific static HTML for public SEO pages.

## Implemented

- Added `scripts/generate-static-seo.mjs`.
- After Vite production build, the script creates route-specific `index.html` files.
- All 14 public sitemap routes receive static:
  - title
  - meta description
  - robots
  - Googlebot
  - canonical
  - Open Graph metadata
  - Twitter metadata
  - JSON-LD
- The 9 authenticated/demo routes receive static `noindex, nofollow` HTML.
- Topic pages reuse the existing curated SEO content source, avoiding a second topic database.
- Breadcrumb, ItemList and FAQ structured data are emitted for topic pages.
- Added `scripts/validate-static-seo.mjs` to verify generated HTML.
- Production build now runs the static generation and validation gates automatically.

## Build flow

```text
SEO generation
  -> sitemap + robots validation
  -> performance validation
  -> final SEO architecture validation
  -> Vite production build
  -> static SEO HTML generation
  -> static SEO HTML validation
```

## Public prerendered routes

- `/`
- `/interview-questions`
- 12 curated topic routes under `/interview-questions/{topic}`

## Protected prerendered routes

- `/login`
- `/signup`
- `/interview/setup`
- `/interview/preparation`
- `/interview/room`
- `/interview/complete`
- `/interview/result`
- `/interview/history`
- `/interview/demo`

## Important deployment note

The production hosting layer must serve generated nested `index.html` files before applying a catch-all SPA fallback. If the hosting provider rewrites every request to the root `index.html` before checking static files, route-specific prerendered metadata will not be delivered.

Phase 9 therefore requires one production HTTP audit after deployment.

## Validation status

The implementation is committed to `feat/interview-seo-complete`. The local production build must be rerun after pulling the latest commits before this phase is declared release-green.
