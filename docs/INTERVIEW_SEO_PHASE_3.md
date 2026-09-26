# Interview SEO — Phase 3

## Scalable SEO URL architecture

Phase 3 establishes a stable URL family for public interview-preparation
content without exposing authenticated interview sessions to search engines.

### Public content URL family

Interview question resources use:

- /interview-questions
- /interview-questions/{topic}

Examples:

- /interview-questions/javascript
- /interview-questions/react
- /interview-questions/java
- /interview-questions/python
- /interview-questions/nodejs
- /interview-questions/dsa
- /interview-questions/frontend-developer
- /interview-questions/backend-developer
- /interview-questions/full-stack-developer
- /interview-questions/behavioral
- /interview-questions/hr

### URL rules

Topic slugs are lowercase, hyphen-separated and limited to URL-safe
alphanumeric segments.

The URL helper provides:

- slugify()
- unslugify()
- getInterviewTopicFromPath()
- getInterviewQuestionsUrl()
- getInterviewTopicLabel()

This keeps URL generation and parsing out of page components.

### Crawl/indexing safety

The new route family is intentionally **not indexable yet**.

Phase 3 creates the architecture and dynamic metadata, but the pages currently
contain only a lightweight shell. Making these URLs indexable before Phase 4
would risk publishing thin pages.

Phase 4 will connect real question/category content and can then explicitly
promote content-rich routes into the Phase 1 indexable route policy.

### Authenticated route separation

Authenticated session URLs remain separate:

- /interview/setup
- /interview/preparation
- /interview/room
- /interview/complete
- /interview/result
- /interview/history

They are not part of the public SEO URL family.

### Sitemap strategy

The current sitemap continues to contain only the homepage. Dynamic topic URLs
must be added only after Phase 4 provides real content and a reliable source of
truth for which slugs actually exist.

This avoids generating sitemap URLs that resolve to empty or placeholder pages.
