# Interview SEO — Phase 7: Performance & Core Web Vitals

## Objective

Improve the Interview application's production loading path and reduce avoidable rendering, network and main-thread work.

## Implemented

- Route-level React lazy loading for the landing page, public question pages and authenticated interview pages.
- Moved Google Fonts loading from CSS `@import` to explicit HTML preconnect + stylesheet loading.
- Added `loading="lazy"` and `decoding="async"` to below-the-fold testimonial images.
- Added explicit image dimensions to reduce layout shifts.
- Optimized the animated `CosmicField` canvas:
  - pauses when outside the viewport;
  - pauses while the document is hidden;
  - reduces particle/fiber density on compact screens;
  - caps canvas device-pixel-ratio;
  - reduces drawing resolution on smaller screens.
- Added `content-visibility: auto` to offscreen landing sections.
- Added Vite production configuration for ES2022 output, CSS code splitting, minification and stable React/MUI vendor chunks.
- Added `scripts/validate-performance.mjs` as a lightweight regression guardrail.
- The normal build now validates SEO generation, SEO crawl assets and performance guardrails before Vite production compilation.

## Validation

From `Interview/`:

```bash
npm run performance:validate
npm run build
```

The performance validator checks that the main optimization contracts remain present in source code. It does not replace Lighthouse/PageSpeed or real-user Core Web Vitals measurement.

## Scope

Phase 7 improves the application's client-side performance architecture. It does not claim a particular Lighthouse score or Core Web Vitals result until the production deployment is measured with real tooling. Server/static rendering and further SEO rendering improvements remain part of the later audit work.
