# Interview SEO — Phase 4

## Dynamic Content + SEO Data Layer

Phase 4 connects the public interview-question URL architecture to a curated content source that is independent from authenticated interview sessions.

### Public content model

Interview/src/data/interviewSeoContent.js is the public SEO content source.

Each topic provides:
- SEO title
- short display title
- meta description
- introduction
- skill/topic coverage
- six structured interview questions
- frequently asked questions

### Current topic families
- Software Engineer
- Frontend Developer
- Backend Developer
- Full Stack Developer
- React
- JavaScript
- Node.js
- Java
- Python
- DSA
- Behavioral
- HR

### Public routes

The content layer powers:
- /interview-questions
- /interview-questions/{topic}

Topic pages are indexable only when the requested slug exists in the content source.
Unknown topic slugs remain non-indexable and are redirected to the public interview-question hub.

### Separation from private AI sessions

The authenticated backend generates questions dynamically for a specific user's interview session. Those session questions are not reused as public SEO content.
This separation prevents private/session-specific data from becoming public crawlable content.

### Sitemap

The sitemap now contains the homepage, interview-question hub and all curated topic URLs.
Phase 6 can automate sitemap generation during the production build.

### SEO metadata

Topic metadata is derived from the same content source used by the page. This prevents title and description drift between visible content and document metadata.

### Phase 5 boundary

Structured data such as Article, WebPage, Breadcrumb and FAQ JSON-LD is intentionally left for Phase 5 so it can consume the same normalized content model.