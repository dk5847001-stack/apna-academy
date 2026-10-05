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
- Phase 7: Complete — frontend quiz engine
- Phase 8: Next — backend + database

## Phase 7 Deliverables
- Added dedicated `/quiz/:attemptId` quiz attempt route.
- Added focused low-distraction quiz room.
- Added question-by-question navigation and Previous / Save & Next controls.
- Added answer selection with accessible pressed-state semantics.
- Added question palette with direct navigation.
- Added answered and marked-for-review states.
- Added Mark for Review / Remove Review Mark.
- Added progress bar and question progress metadata.
- Added visible countdown timer with final-minute warning state.
- Added frontend attempt persistence in `sessionStorage` for refresh continuity.
- Added automatic submit prompt when the frontend timer reaches zero.
- Added manual submit confirmation dialog.
- Added post-submit summary for answered, unanswered, marked and time-used values.
- Added responsive quiz-room layouts for desktop, tablet and mobile.
- Added semantic controls and native keyboard-accessible buttons.
- Added a small frontend question fixture set for engine UI testing only.
- Kept scoring, answer-key authority, server timing, attempt validation, persistence and leaderboard calculation out of the frontend; these are Phase 8 backend responsibilities.
- Added safe fallbacks for missing profiles and unavailable question sets.
- Preserved all previous Quiz phases without touching other ApnaAcademy applications.

## Security Boundary
Phase 7 browser state is **not authoritative**. Users can modify client-side state. The frontend must never be trusted for final score, correct answers, attempt duration or leaderboard position. Phase 8 will introduce server-owned attempts, question snapshots, validation and scoring.

## Design Guardrails
- Active quiz screens remain calmer than marketing pages.
- Orange is reserved for meaningful action/state emphasis.
- ThreeUI/WebGL and advanced GSAP motion remain deferred to the dedicated motion phase.
- No existing ApnaAcademy frontend/backend, Interview app, admin app, payment flow or database schema was modified.

See `ARCHITECTURE.md` for technical boundaries and `PRODUCT_ARCHITECTURE.md` for the approved product contract.
