# Interview SEO — Phase 8: Final SEO & Search Console Readiness

## Objective

Provide a final automated release gate for the Interview application's Phase 1–7 SEO architecture.

## Final checks

The new `npm run seo:final` validation checks:

- root HTML has canonical, Open Graph and Twitter metadata;
- document language is `en-IN`;
- robots.txt references the production sitemap;
- SEO origin remains environment-configurable;
- indexable routes use the expected robots directives;
- curated content controls indexability;
- WebSite and BreadcrumbList structured data remain present;
- route-level SEO remains mounted;
- structured data is applied by the SEO component;
- topic URL architecture uses the content source as its single topic source;
- sitemap contains only Interview-origin URLs;
- protected/authenticated/demo routes are absent from the sitemap;
- sitemap contains no duplicate URLs;
- every curated topic has a sitemap URL;
- the production build executes SEO generation, SEO validation, performance validation and final SEO validation before Vite.

## Release command

From `Interview/`:

```bash
npm run seo:final
npm run build
```

## Google Search Console readiness

After deploying this branch, the production property should be validated using the actual public URLs. Submit the generated sitemap:

`https://interview.apnaacademy.me/sitemap.xml`

Then use URL Inspection for the homepage and representative public topic pages. Indexing is controlled by Google and is not guaranteed merely by submitting a sitemap.

## Important limitation

This phase is an engineering/release validation layer. It does not claim a specific ranking, indexing date, Lighthouse score, Core Web Vitals score or rich-result eligibility. Those require live production measurement and Google's own crawling/processing.
