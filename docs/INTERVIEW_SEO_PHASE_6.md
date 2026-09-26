# Interview SEO — Phase 6: Crawl & Indexation Architecture

## Objective

Make the Interview app's crawl-control assets build-generated and synchronized with the public SEO content source.

## Implemented

- Added `Interview/scripts/generate-seo.mjs`.
- Sitemap URLs are generated from:
  - the Interview homepage;
  - the public interview-question hub;
  - every topic returned by `getInterviewSeoTopics()`.
- `robots.txt` is generated with the configured Interview origin.
- Added `Interview/scripts/validate-seo.mjs`.
- Validation checks:
  - sitemap XML root exists;
  - every expected public URL appears exactly once;
  - sitemap URL count matches the content source;
  - `robots.txt` points to the same sitemap origin;
  - authenticated/session/demo routes are not present in the sitemap.
- The build now generates and validates crawl assets before Vite compiles the application.

## Crawl policy

The sitemap contains only public, content-rich routes. Authentication and interview-session routes remain outside the sitemap and continue to receive `noindex, nofollow` from the application's SEO policy.

## Single source of truth

Adding a new topic to `Interview/src/data/interviewSeoContent.js` automatically adds its public topic URL to the sitemap during the next build. Removing a topic removes its URL from the generated sitemap.

## Build commands

From `Interview/`:

```bash
npm run seo:generate
npm run seo:validate
npm run build
```

The normal `npm run build` command runs generation and validation automatically before `vite build`.

## Scope

This phase improves crawl architecture and reduces manual sitemap drift. It does not guarantee search rankings, and it does not replace server/static rendering work planned for later SEO phases.
