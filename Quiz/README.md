# Apna Academy Quiz

Standalone quiz platform for B.Tech, BCA, BBA, MBA, MCA, Diploma and other UG/PG students.

## Independence Boundary
All Quiz code, configuration, APIs, database models, authentication, quiz logic, administration and deployment configuration remain inside `Quiz/Frontend/` and `Quiz/Backend/`. No existing ApnaAcademy application is modified for Quiz.

## Current Status
- Phase 1: Complete — independent technical architecture
- Phase 2: Complete — product architecture, UX flows and system contracts
- Phase 3: Complete — premium design system and responsive application shell
- Phase 4: Complete — SEO-ready student landing page
- Phase 5: Complete — student registration/profile
- Phase 6: Complete — quiz discovery + quiz details
- Phase 7: Next — quiz engine

## Phase 6 Deliverables
- Added `/quizzes` as the dedicated quiz discovery/catalogue experience.
- Added searchable quiz catalogue with client-side query matching across title, description, subject, type and tags.
- Added filters for degree, quiz type, subject, difficulty and duration.
- Added clear/reset filtering and a no-results state.
- Added responsive quiz cards with type, difficulty, question count, duration, marks and tags.
- Added SEO-friendly public quiz detail route pattern: `/quizzes/:quizId`.
- Added quiz detail pages with:
  - Title and description
  - Quiz type and difficulty
  - Question count
  - Duration
  - Total marks
  - Negative marking
  - Attempt limit
  - Target degree/branch
  - Subject
  - Difficulty/level
  - Expected result behavior
  - Relevant tags
  - Registration/continue CTA
- Added a safe not-found state for invalid quiz IDs.
- Added profile-aware detail CTA: registered students can continue toward the future quiz flow; new students are directed to registration.
- Added responsive layouts for desktop, tablet and mobile, preserving the 320px minimum contract.
- Kept quiz catalogue data static and frontend-owned for this phase; no backend, scoring, attempt state or question delivery was introduced early.
- Preserved the approved product boundary and did not modify the existing ApnaAcademy frontend, backend, Interview app, admin app, payment flow or database schemas.

## Design Guardrails
- Light premium interface with orange as the primary action color.
- Catalogue is discovery-focused; the active quiz-taking experience remains deferred to Phase 7.
- ThreeUI/WebGL and advanced GSAP motion remain intentionally deferred to the dedicated motion phase.
- Static catalogue data is a presentation contract only and will be replaced by server-owned quiz data in the backend/API phases.
- Public catalogue/detail pages are intended for future indexing; active attempts, results and profile remain non-public product surfaces.

See `ARCHITECTURE.md` for technical boundaries and `PRODUCT_ARCHITECTURE.md` for the approved product contract.
