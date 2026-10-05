# Apna Academy Quiz

Standalone quiz platform for B.Tech, BCA, BBA, MBA, MCA, Diploma and other UG/PG students.

## Independence Boundary
All Quiz code, configuration, APIs, database models, authentication, quiz logic, administration and deployment configuration remain inside `Quiz/Frontend/` and `Quiz/Backend/`. No existing ApnaAcademy application is modified for Quiz.

## Current Status
- Phase 1: Complete — independent technical architecture
- Phase 2: Complete — product architecture, UX flows and system contracts
- Phase 3: Complete — premium design system and responsive application shell
- Phase 4: Complete — SEO-ready student landing page
- Phase 5: Next — student registration/profile

## Phase 4 Deliverables
- Student-first landing page aligned with the approved Phase 2 information architecture.
- Hero with clear value proposition and primary quiz discovery CTA.
- Quiz experience preview showing question, progress, timer and result feedback.
- Academic/category discovery for Engineering, Computer Applications, Business & Management, and Aptitude & Placement.
- Featured quiz catalogue preview with type, difficulty and duration/question metadata.
- Three-step “choose → take → understand” workflow explanation.
- Benefits section focused on attempts, results and fair competition.
- Privacy-conscious leaderboard CTA.
- Final conversion CTA to the quiz catalogue.
- Responsive layouts for desktop, tablet and mobile, including the 320px minimum contract.
- Accessible semantic sections, headings, links, focus states and reduced-motion support inherited from Phase 3.
- No backend, authentication, scoring, quiz engine or unrelated ApnaAcademy code changed.

## Design Guardrails
- Light premium interface with orange as the primary action color.
- Marketing pages can use subtle visual motion; active quiz-taking remains calmer.
- ThreeUI/WebGL and advanced GSAP motion remain intentionally deferred to the dedicated motion phase.
- Landing-page content uses static presentation data until the quiz catalogue/API is implemented in later phases.

See `ARCHITECTURE.md` for technical boundaries and `PRODUCT_ARCHITECTURE.md` for the approved product contract.
