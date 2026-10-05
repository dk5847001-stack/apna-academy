# Apna Academy Quiz — Phase 1 Architecture Contract

Status: Approved for Phase 1  
Scope: `Quiz/Frontend` + `Quiz/Backend` only

## 1. Architecture Principle

The Quiz platform is a standalone product inside the monorepo. It may share the repository, but it must not share runtime dependencies or application code with the existing ApnaAcademy platform.

The Quiz frontend communicates only with the Quiz backend API.

```
Student Browser
      |
      v
Quiz Frontend
Quiz/Frontend
      |
      | HTTPS REST API
      v
Quiz Backend
Quiz/Backend
      |
      v
Quiz MongoDB Database
```

## 2. Hard Boundary

### Allowed

- `Quiz/Frontend/**`
- `Quiz/Backend/**`
- Future Quiz-only files/directories created under `Quiz/`

### Forbidden Without Explicit Approval

- `Backend/**`
- `Interview/**`
- Main ApnaAcademy frontend
- Existing admin application
- Existing course/auth/payment code
- Existing database models or schemas
- Existing production environment configuration

A Quiz feature that appears to require an outside change must stop and be reviewed instead of silently modifying another application.

## 3. Frontend Contract

The frontend is responsible for:

- presentation and responsive UI
- routing
- student-facing forms
- quiz navigation state
- timer presentation
- answer selection state
- accessibility
- result visualization
- API communication

The frontend must never contain:

- answer keys
- authoritative scoring logic
- trusted attempt state
- admin secrets
- database credentials
- private API keys

Final score and correctness must come from the backend.

## 4. Backend Contract

The backend will be responsible for:

- API routing
- request validation
- student/participant records
- quiz and question management
- attempt lifecycle
- server-side timing validation
- server-side scoring
- result persistence
- leaderboard calculations
- admin authorization
- rate limiting and abuse protection
- database access

The backend will expose a versioned API namespace, planned as:

`/api/v1/*`

Exact endpoint names will be finalized during the backend implementation phase.

## 5. Data Ownership

The Quiz system owns its own data model.

Planned core collections/entities:

- Participant
- Quiz
- Question
- Attempt
- Answer/Response
- Result
- Leaderboard/Ranking
- Admin

References between these entities will be Quiz-internal IDs. Existing ApnaAcademy user IDs are not required.

## 6. Security Rules

These rules are mandatory for implementation:

1. Never trust the client for final score.
2. Never send the complete answer key to the browser before submission.
3. Validate quiz ownership/publication status on the server.
4. Validate attempt eligibility on the server.
5. Validate submitted answers against the server-side question set.
6. Prevent duplicate/invalid submissions.
7. Store authoritative attempt timestamps on the server.
8. Protect admin endpoints with dedicated authorization.
9. Keep secrets in environment variables.
10. Never commit production secrets.

## 7. Quiz Attempt Lifecycle

Planned lifecycle:

```
DISCOVER
   ↓
VIEW DETAILS
   ↓
REGISTER / IDENTIFY
   ↓
START ATTEMPT
   ↓
IN PROGRESS
   ↓
SUBMIT / TIME EXPIRED
   ↓
SERVER SCORING
   ↓
RESULT STORED
   ↓
RESULT DISPLAY
   ↓
LEADERBOARD / ANALYTICS
```

An attempt must have a server-owned lifecycle and status. The browser is a client of that lifecycle, not its authority.

## 8. Frontend Technology Direction

Current foundation:

- React 19
- Vite 8
- JavaScript/JSX
- Oxlint

Planned UI stack:

- Taste Skill: design quality and anti-slop design rules
- 21st.dev: reusable React UI patterns/components
- ThreeUI: selected Three.js/WebGL visual experiences
- GSAP: purposeful motion and micro-interactions

Important UX rule: animation must never interfere with quiz readability, timer visibility, keyboard access, or exam focus.

## 9. Backend Technology Direction

Planned baseline:

- Node.js
- Express
- MongoDB
- Mongoose
- Helmet
- CORS
- Rate limiting
- Zod or equivalent request validation
- Structured error handling
- Environment-based configuration

The exact package set will be finalized before implementation rather than copied blindly from the main ApnaAcademy backend.

## 10. Environment Isolation

Frontend environment variables will use a Quiz-specific namespace/configuration.

Backend environment variables will be stored only under Quiz backend deployment configuration.

No existing ApnaAcademy environment variable should be imported or reused by default.

Planned local services:

- Quiz Frontend: Vite development server
- Quiz Backend: independent Node/Express server
- Quiz Database: independent MongoDB database/database name

## 11. Deployment Isolation

The Quiz system must be independently deployable.

Target topology:

```
quiz.apnaacademy.me
        |
        v
Quiz Frontend deployment

api-quiz.apnaacademy.me
        |
        v
Quiz Backend deployment
        |
        v
Quiz MongoDB database
```

These are target architecture names only; final production hosts/domains will be decided during deployment.

## 12. Phase Gates

Phase 1 is complete only when:

- [x] Existing Quiz folders audited
- [x] Frontend foundation identified
- [x] Backend foundation identified
- [x] Independence boundary documented
- [x] Frontend/backend responsibilities documented
- [x] Data ownership documented
- [x] Security principles documented
- [x] Attempt lifecycle documented
- [x] Deployment isolation documented
- [x] No existing non-Quiz application modified

Next phase may begin only after this architecture contract is accepted.
