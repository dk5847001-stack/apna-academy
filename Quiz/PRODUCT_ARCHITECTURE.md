# Apna Academy Quiz — Phase 2 Product Architecture

Status: COMPLETE
Scope: Quiz product only
Branch: main

## Product Goal
A standalone assessment platform for B.Tech, BCA, BBA, MBA, MCA, Diploma and other UG/PG students. It must serve beginners, regular learners and competitive learners without requiring knowledge of the platform.

## Product Pillars
1. Learn — practice by subject, topic and difficulty.
2. Test — structured timed assessments.
3. Compete — privacy-safe rankings.
4. Improve — analytics and weak-area discovery.
5. Verify — future certificates/verified assessments.

## Roles
### Student
Profile, discover quizzes, view details, start eligible attempts, answer/submit, view results/history, analytics and permitted leaderboards.

### Admin
Manage quizzes, question bank, taxonomy, publication/scheduling, marking/attempt rules, participants, attempts, results, rankings and exports. Backend authorization is mandatory.

Future roles reserved: Content Manager, Moderator, Organization/College Manager.

## Student Profile
Required: full name, email, mobile, PRN/roll number, degree/program, branch/specialization, college/university.

Recommended: semester/year, city, state, graduation year.

Collect only data required for a declared feature.

## Academic Taxonomy
Programs: B.Tech, BCA, BBA, MBA, MCA, Diploma, Other UG, Other PG.

B.Tech branches include CSE, IT, ECE, EE/EEE, Mechanical, Civil, Chemical, AI/ML, Data Science and Other.

Taxonomy must be data-driven, not hard-coded into page components.

## Quiz Taxonomy
Types: Practice Quiz, Subject Test, Mock Test, Placement Test, College Test, Competitive Quiz, Certification Test, future Live Quiz.

Difficulty: Easy, Medium, Hard, Mixed.

Subjects/topics are extensible, including Java, DSA, DBMS, OS, CN, Web Development, Aptitude, Reasoning, Business, Finance, Marketing and Management.

## Public Routes
| Route | Purpose |
|---|---|
| / | Landing/discovery |
| /quizzes | Quiz catalogue |
| /quizzes/:quizId | Quiz details/instructions |
| /register | Student registration |
| /quiz/:attemptId | Active attempt |
| /result/:attemptId | Result |
| /results | Result history |
| /leaderboard | Rankings |
| /profile | Profile |
| /about | Product information |
| /help | Help/rules |

## Admin Routes
/admin
/admin/login
/admin/dashboard
/admin/quizzes
/admin/quizzes/new
/admin/quizzes/:quizId
/admin/questions
/admin/participants
/admin/attempts
/admin/results
/admin/leaderboard
/admin/settings

Admin authorization is always server-enforced.

## Landing Information Architecture
1. Hero + Explore Quizzes CTA
2. Program/category discovery
3. Featured/popular quizzes
4. How it works
5. Benefits/performance improvement
6. Leaderboard preview
7. Trust/rules/privacy
8. Final CTA
9. Compact footer

## Catalogue
Support search and filters for degree, branch, subject, type, difficulty, duration, question count and sorting.

Quiz cards show title, purpose, subject, difficulty, question count, duration, marking policy, availability and status.

## Quiz Details
Before start show title, objective, audience, question count, duration, difficulty, marking scheme, negative marking, attempt limit, result behavior and rules.

Use a confirmation step for limited attempts.

## Registration Flow
First-time:
Discover -> Details -> Register -> Confirm -> Start

Returning:
Discover -> Details -> Identify/Continue -> Start

Use clear labels, inline validation and mobile-friendly inputs.

## Quiz Engine
Required: question number, question content, options, timer, progress, next/previous, mark for review, question palette and submit.

States: answered, unanswered, marked for review.

Rules: keyboard accessible, touch-friendly, clear selected state, submit confirmation, near-expiry warning and automatic server-defined expiry submission.

No decorative animation or 3D effects while students are reading questions.

## Attempt Lifecycle
CREATED -> STARTED -> IN_PROGRESS -> SUBMITTING -> SUBMITTED

Terminal alternatives: EXPIRED, ABANDONED, INVALIDATED.

Only the backend authoritatively transitions an attempt to a scored terminal state.

## Results
Show score, percentage, correct, incorrect, skipped, accuracy, time used, rank/percentile where eligible, topic performance and improvement suggestions.

Keep the first result view simple and understandable.

## Leaderboard
Filters: quiz, subject, degree/program, branch, college where permitted, overall.

Use deterministic backend ranking rules. Default display should use display name/masked identity and never expose email/mobile.

## Admin
Modules: Overview, Quizzes, Question Bank, Categories, Participants, Attempts, Results, Leaderboards, Settings.

Quiz creation supports metadata, instructions, questions, correct answer, explanation, marks, negative marks, duration, attempt limit, randomization, publication and scheduling.

Questions are reusable through a question bank.

## Data Relationships
Participant 1:N Attempt
Quiz 1:N Question
Quiz 1:N Attempt
Attempt 1:N Answer
Attempt 1:1 Result
Question N:1 Topic

## Critical Integrity Rule
When an attempt starts, the server establishes the question set used by that attempt. Later quiz/question edits must never silently change active or completed attempts.

## Responsibility Boundary
Frontend: presentation, routing, forms, navigation state, timer display, answer collection and API communication.

Backend: identity/eligibility validation, attempt creation, authoritative timing, question truth, scoring, persistence and rankings.

The browser is never trusted for final scoring.

## Frontend State
Server state: quizzes, profile, attempts, results, leaderboard, admin data.
UI state: filters, modals, tabs, drawers and animation state.
Attempt state: current question, selected answers, marked questions and local navigation.

Server state remains authoritative.

## Responsive Contract
Support 320px+, 768px+, 1024px+ and 1440px+ layouts. No horizontal overflow, tiny touch targets, inaccessible timers or desktop-only quiz controls.

## Design System Direction
Premium, modern, educational, trustworthy, focused and distinctive.

Taste Skill: design quality/anti-slop rules.
21st.dev: selected React component patterns.
ThreeUI: limited high-impact 3D/WebGL moments.
GSAP: purposeful transitions and micro-interactions.

Do not mix unrelated visual styles. The exam screen is calmer than the marketing experience.

## Accessibility
Semantic HTML, keyboard navigation, visible focus, labels, contrast, reduced-motion support, screen-reader-friendly controls and no color-only information.

## Loading/Error/Empty
Every major data page needs loading, empty, recoverable error and not-found states. Never expose raw API errors to students.

## SEO Direction
Indexable where appropriate: landing, catalogue and public quiz details.

Do not target indexing for active attempts, personal results, profile or admin.

Private pages must be protected at runtime; robots/meta rules are not a security mechanism.

## Analytics Reserved
quiz_list_view
quiz_detail_view
quiz_start
question_answered
question_marked
quiz_submitted
result_viewed
leaderboard_viewed

Do not capture answer content unnecessarily.

## Phase 2 Acceptance
- [x] Product goal and pillars
- [x] Roles and permissions direction
- [x] Student profile
- [x] Academic and quiz taxonomy
- [x] Public/admin routes
- [x] User journeys
- [x] Catalogue and quiz-detail UX
- [x] Quiz engine and attempt lifecycle
- [x] Result and leaderboard UX
- [x] Admin architecture
- [x] Data relationships and snapshot integrity
- [x] Frontend/backend responsibility boundary
- [x] Responsive/accessibility contracts
- [x] Design-tool responsibilities
- [x] SEO and analytics direction

## Phase 3 Gate
Phase 3 can begin with the premium design system and application shell. Core routes, journeys, attempt lifecycle and ownership rules must not be changed casually.
