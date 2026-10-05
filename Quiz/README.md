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
- Phase 8: Complete — backend + database
- Phase 9: Complete — results + analytics
- Phase 10: Complete — leaderboard + competitive layer
- Phase 11: Complete — admin panel, authentication, question bank and quiz management
- Phase 12: Next — advanced quiz features

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


## Phase 9 Deliverables

- Added server-backed result retrieval for completed attempts.
- Added participant-scoped result authorization: an attempt result is returned only when its participant id matches the request.
- Added result history API with the latest 50 completed attempts.
- Added server-derived score, max marks, percentage, attempted, correct, incorrect, skipped and accuracy metrics.
- Added server-derived time used and time remaining metrics.
- Added topic-level performance analytics using immutable attempt question snapshots.
- Added improvement suggestions based on performance, weak topics and skipped questions.
- Kept correct answers out of result responses.
- Added frontend integration for participant upsert, quiz lookup, secure attempt start/resume, server answer persistence, server timer, server submission and result navigation.
- Added `/result/:attemptId` verified result analytics page.
- Added `/results` participant result history page.
- Added `VITE_QUIZ_API_URL` configuration example.
- Kept leaderboard/ranking and admin question authoring out of this phase.
- All Quiz work remains isolated under `Quiz/Frontend/` and `Quiz/Backend/`.

## Phase 9 Security Contract

1. Result APIs require both `attemptId` and `participantId`.
2. The server verifies attempt ownership before returning analytics.
3. Only `SUBMITTED` and `EXPIRED` attempts have readable final results.
4. Result payloads never expose `correctOption`.
5. Score and analytics are recomputed from the immutable attempt snapshot and stored answers.
6. Topic analytics fall back to the quiz subject when a question has no explicit topic.
7. Result history is capped at 50 records per participant request.
8. Client-side result UI is presentation only; it is not trusted for score or ranking.
9. Authentication/identity hardening remains a future concern; current participant identity is device/profile-linked and is not a substitute for production authentication.

## Phase 9 Gate

Phase 10 must consume server-owned result data only. No leaderboard implementation should trust frontend score, percentage or rank values.

## Phase 10 Deliverables

- Added server-owned leaderboard aggregation under the Quiz backend.
- Added public leaderboard API: GET /api/v1/leaderboard.
- Added leaderboard scopes for overall, quiz, subject, degree, branch and college views.
- Added optional quiz, subject, degree, branch and college filters.
- Added pagination with a maximum of 100 entries per page.
- Added competition ranking with deterministic tie-breakers.
- Ranking priority: average percentage, completed quizzes, average accuracy, lower average time, then earlier completion.
- For repeated attempts on the same quiz, only the participant's best completed attempt for that quiz contributes to the competitive score.
- Overall and filtered rankings aggregate each participant's best attempt per matching quiz, preventing repeated attempts from artificially inflating leaderboard volume.
- Added privacy-safe display names using first name plus last initial.
- Public leaderboard responses never expose email, mobile or roll/PRN.
- Added optional current-participant rank (me) without exposing other private identity data.
- Added responsive /leaderboard frontend page with filters, ranking table and current-rank card.
- Kept leaderboard score/rank calculation entirely server-owned.
- Kept admin authoring, moderation and certification/live leaderboard features for later phases.
- All Quiz work remains isolated under Quiz/Frontend/ and Quiz/Backend/.

## Phase 10 Ranking Contract

1. Only SUBMITTED and EXPIRED attempts are eligible.
2. An individual participant can contribute at most one attempt per quiz to a leaderboard view: their best completed attempt.
3. Best attempt ordering for the same quiz is percentage, accuracy, lower time, then earlier submission.
4. Participant leaderboard metric is average percentage across eligible best attempts.
5. Tie-breakers are completed quiz count, average accuracy, lower average time and earlier completion.
6. Ranking uses competition ranking, so equal ranking metrics share a rank and the next rank skips accordingly.
7. Public display names are privacy-reduced; contact details and PRN/roll numbers are never returned.
8. Client-provided score, percentage or rank is never accepted by the leaderboard API.
9. Leaderboard filters operate against server-side quiz and participant records.
10. Phase 11 must not replace this server-owned ranking contract with frontend-calculated ranks.


## Phase 11 Security Contract

1. Participant identity is never accepted as admin authentication.
2. Admin routes are server-protected with signed expiring tokens.
3. Admin passwords are stored only as scrypt-derived hashes.
4. Admin login is rate-limited.
5. Public quiz APIs continue to exclude correct answers.
6. Admin question APIs expose answer keys only after authorization.
7. Quiz deletion is non-destructive archive/unpublish.
8. Existing attempt snapshots remain authoritative after question edits.
9. Frontend route hiding is not treated as authorization.
10. Admin secrets remain environment-only.

## Phase 11 Environment

Add ADMIN_EMAIL, ADMIN_PASSWORD_HASH and ADMIN_TOKEN_SECRET to Quiz/Backend/.env. Generate a password hash with `npm run admin:hash -- "YourStrongPassword"`. Never commit secrets.
