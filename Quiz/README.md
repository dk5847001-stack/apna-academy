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
- Phase 12: Complete — advanced quiz configuration, randomization, pass/fail and answer review
- Phase 13: Complete — GSAP motion system + ThreeUI/WebGL hero layer with reduced-motion safeguards

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


## Phase 12 Deliverables

- Added server-controlled question randomization per attempt.
- Added server-controlled option randomization with correct-answer mapping preserved internally.
- Added immutable per-attempt rules for passing percentage, review availability and explanation visibility.
- Added server-side pass/fail calculation.
- Added post-result learning review without exposing the answer key to the client.
- Added configurable pass percentage, shuffle questions, shuffle options, review permission and explanation visibility to Admin quiz authoring.
- Preserved server-owned timing, scoring, attempt limits and immutable snapshots.
- All Phase 12 changes remain isolated under Quiz/Frontend and Quiz/Backend.

## Phase 12 Security Contract

1. Randomization happens on the server, never from trusted client state.
2. Randomized order and option mapping are stored in the attempt snapshot.
3. Correct answers remain server-side during an active attempt.
4. Completed result review does not return correct answer keys.
5. Pass/fail is calculated from the server snapshot and snapshotted pass threshold.
6. Later admin changes cannot alter rules or question order for an existing attempt.
7. Review/explanation visibility is controlled by the attempt snapshot.


## Phase 13 Deliverables

- Added GSAP 3.15 with the React-safe `@gsap/react` integration.
- Added GSAP ScrollTrigger for intentional reveal animations on marketing sections.
- Added a scoped landing-page motion timeline for navbar, hero copy and hero visual entrance.
- Added responsive GSAP behavior using `gsap.matchMedia()` so desktop-only pointer tilt is not enabled on smaller screens.
- Added a subtle pointer-driven 3D tilt interaction to the landing quiz preview card.
- Added slow ambient motion to the hero orbs and score badge.
- Added scroll-triggered section and content-card reveals without changing quiz logic or navigation.
- Added the community `@designcodeio/threeui` package and a restrained ThreeUI/WebGL layer behind the landing-page quiz preview.
- Kept the ThreeUI layer decorative and pointer-inert so it never competes with primary content or controls.
- Added explicit `prefers-reduced-motion` handling that disables the animated layer and hides the decorative ThreeUI scene.
- Kept active quiz-taking screens free from marketing motion to preserve concentration and timing clarity.
- Kept all Phase 13 changes inside `Quiz/Frontend/` and did not modify the existing ApnaAcademy, Interview or main Admin applications.

## Phase 13 Motion Contract

1. Motion is progressive enhancement; the application remains usable if animation is disabled.
2. `prefers-reduced-motion: reduce` disables GSAP entrance/scroll motion and the decorative ThreeUI scene.
3. WebGL/ThreeUI is decorative only and never contains required quiz information or controls.
4. Pointer tilt is limited to the desktop landing hero and does not affect navigation or quiz state.
5. Quiz-room timer, answer selection, submission, scoring and result data remain untouched by the motion layer.
6. ScrollTrigger animations are one-time reveals to avoid persistent scroll-linked workload.
7. No client-side score, timing or leaderboard authority was introduced in this phase.

## Phase 13 Dependencies

The Quiz frontend now uses:

- `gsap`
- `@gsap/react`
- `@designcodeio/threeui`
- `three`

After pulling the changes, run `npm install` inside `Quiz/Frontend` so the dependency lockfile is synchronized with the updated `package.json`.


## Phase 14 — Production QA + Deployment Readiness — Complete

Phase 14 closes the implementation roadmap with a production-readiness contract. It does not claim a live deployment that has not been executed from this environment.

### Production-readiness changes

- Production frontend builds no longer silently fall back to the local Quiz API URL. `VITE_QUIZ_API_URL` must be supplied for production builds.
- Development builds retain the local `http://localhost:5001` fallback for convenience.
- Added/updated `Quiz/Frontend/.env.example` with local and production API configuration examples.
- Kept all Quiz configuration isolated from the main ApnaAcademy application.
- Confirmed the production architecture remains:
  - Static React/Vite frontend
  - Independent Node/Express Quiz API
  - Independent MongoDB database
  - Separate admin surface within the Quiz frontend
  - HTTPS-only production traffic
- Production health verification target: `GET /health`.
- Production smoke-test sequence:
  1. frontend loads
  2. API health is OK
  3. quiz catalogue loads
  4. quiz details load
  5. participant registration works
  6. secure attempt starts/resumes
  7. answers persist
  8. server expiry/submission works
  9. result analytics load
  10. leaderboard loads
  11. admin login and protected CRUD work
  12. refresh/deep links work for public and admin routes
  13. mobile 320px+ layouts have no horizontal overflow
  14. reduced-motion mode remains usable

### Phase 14 Security / deployment checklist

Before production launch, verify in the actual deployment environment:

- `NODE_ENV=production`
- production `MONGODB_URI`
- exact production frontend origin in `CLIENT_ORIGINS`
- `ADMIN_EMAIL`
- strong `ADMIN_PASSWORD_HASH`
- strong unique `ADMIN_TOKEN_SECRET`
- `QUIZ_ATTEMPT_TTL_BUFFER_SECONDS` set appropriately
- `VITE_QUIZ_API_URL` points to the deployed Quiz API
- HTTPS enabled for frontend and API
- MongoDB network access restricted to required infrastructure
- no `.env` files or secrets committed to Git
- API rate limits remain enabled
- Helmet/CORS remain enabled
- production logs do not contain passwords, tokens, answer keys or personal contact data
- admin credentials tested with a real login before launch

### Important validation boundary

The repository changes are production-readiness changes, but a live production deployment, real MongoDB execution, browser/device matrix, DNS/CDN configuration and external uptime test require the actual deployment environment. They are therefore listed as verification gates rather than falsely marked as executed.

### Final roadmap status

- Phase 1–13: Complete
- Phase 14: Complete — production QA/deployment readiness implemented and documented
