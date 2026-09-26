# Interview SEO — Phase 5

## Structured data and semantic SEO

Phase 5 adds a centralized JSON-LD generator that consumes the same route and content configuration used by the visible public pages.

### Schema graph

Indexable Interview routes receive:
- Organization
- WebSite
- WebPage
- BreadcrumbList

Curated topic pages additionally receive:
- ItemList for the visible interview-question collection
- FAQPage for the visible FAQ section

### Route safety

Structured data is generated only when the SEO configuration marks the route as indexable.
Authenticated/noindex routes therefore do not receive public FAQ or question schemas.

### Single source of truth

Topic titles, descriptions, questions and FAQs are read from Interview/src/data/interviewSeoContent.js.
The same source drives page content, metadata and structured data, reducing inconsistencies between visible content and JSON-LD.

### Duplicate prevention

The SEO component owns one JSON-LD script with a stable DOM id. Route changes remove the previous script before inserting the current graph.

### Visible-content alignment

FAQ structured data is generated only from FAQ entries rendered on the topic page. Question ItemList entries are generated from the same questions rendered on that page.

### Phase 6 boundary

Phase 6 will focus on crawl architecture and automated sitemap/robots generation so new content can be published without manually maintaining every URL.