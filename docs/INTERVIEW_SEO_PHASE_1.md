# Interview SEO — Phase 1

## Scope

Phase 1 establishes the technical SEO foundation and crawl/indexation boundary for
the standalone ApnaAcademy Interview AI React application.

Production origin:

- https://interview.apnaacademy.me

## Current route classification

### Public and indexable

- /

The homepage is currently the only route with enough stable, public-facing content
to be treated as an indexable SEO entry point.

### Application/session routes — noindex

- /login
- /signup
- /interview/setup
- /interview/preparation
- /interview/room
- /interview/complete
- /interview/result
- /interview/history

These routes represent authentication, personalized interview state, private
results, or an active application flow. They should not become search landing
pages.

### Demo route

- /interview/demo

This route is currently a placeholder rather than a content-rich public landing
page, so it is not included in the indexable set. It can become indexable after
Phase 3/4 gives it unique, useful, crawlable content.

## Implemented foundation

- Added a dedicated route-level SEO policy.
- Added noindex, nofollow as the default policy for non-public routes.
- Added a production robots.txt.
- Added an initial sitemap containing only the public homepage.
- Kept future public SEO routes extensible through INDEXABLE_ROUTES.
- Preserved the existing application routing and UI flow.

## Phase 1 audit findings

1. The app is a Vite SPA with a custom history router.
2. index.html contains baseline title and description metadata.
3. AppRoutes currently updates title/description after client navigation.
4. There is no dedicated Interview robots.txt or sitemap in the app.
5. The app currently has no centralized crawl/indexability policy.
6. Unknown paths fall back to a placeholder page and should remain non-indexable.
7. The current public content surface is the homepage; deeper SEO content should be
   introduced as dedicated, useful URLs rather than thin route copies.
8. Canonical URL management, Open Graph/Twitter metadata, JSON-LD, automated
   sitemap generation, SEO landing pages, and server/static HTML rendering are
   intentionally reserved for later phases.

## Phase 1 target architecture

route -> route policy -> SEO metadata layer -> canonical/schema layer -> sitemap

Phase 2 will consume this policy to build the centralized dynamic metadata layer.
