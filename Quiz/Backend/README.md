# Apna Academy Quiz Backend

Independent backend for the Quiz product. This directory owns the Quiz API and Quiz database contract.

## Phase 8 — Backend + Database — Complete

## Phase 9 — Results + Analytics — Complete

- Node.js + Express API under `/api/v1/*`
- Independent MongoDB connection
- Mongoose models for Participant, Quiz, Question and Attempt
- Server-owned attempt lifecycle and timestamps
- Immutable question snapshots created at attempt start
- Correct answers never returned by public attempt APIs
- Server-side scoring and negative marking
- Attempt limits and duplicate active-attempt protection
- Automatic expiry scoring
- Helmet, CORS and rate limiting
- Zod request validation
- Structured API errors
- Health endpoint
- Development seed script
- Environment variables isolated to `Quiz/Backend`
- Existing ApnaAcademy backend is not imported or reused

## API

- `GET /health`
- `POST /api/v1/participants`
- `GET /api/v1/quizzes`
- `GET /api/v1/quizzes/:slug`
- `POST /api/v1/attempts/start`
- `GET /api/v1/attempts/:attemptId`
- `PATCH /api/v1/attempts/:attemptId/questions/:questionId`
- `POST /api/v1/attempts/:attemptId/submit`
- `GET /api/v1/results?participantId=<participant-id>`
- `GET /api/v1/results/:attemptId?participantId=<participant-id>`

### Start Attempt

```json
{
  "participantId": "<participant-id>",
  "quizId": "<quiz-object-id>"
}
```

The response contains public question data only. The server retains `correctOption` inside the private attempt snapshot.

### Save Answer

```json
{
  "selectedOption": "A"
}
```

The server verifies that the question belongs to the attempt, verifies that the attempt is still open, and stores the answer.

### Results & Analytics

Completed attempts expose server-calculated analytics only after the attempt is `SUBMITTED` or `EXPIRED`. Result access requires both the attempt id and participant id; the server verifies ownership before returning data. Analytics include score, percentage, correct/incorrect/skipped, accuracy, time used, time remaining, topic-level performance and improvement suggestions. Correct answers are not exposed.

### Submit

The server calculates score, percentage, correct, incorrect, skipped, accuracy and time used from the server-owned snapshot and stored answers. A client-provided score is never accepted.

## Security Contract

1. Never trust client score or timer.
2. Never return the answer key in public attempt responses.
3. Check expiration against server time.
4. Only allow questions belonging to the attempt snapshot.
5. Enforce maximum attempts server-side.
6. Prevent multiple active attempts for the same participant and quiz.
7. Snapshot questions at start so later question edits cannot alter an active attempt.
8. Keep database credentials and secrets in environment variables.
9. Apply request rate limits and security headers.
10. Keep Quiz runtime and data isolated from the existing ApnaAcademy backend.

## Local Setup

1. Copy `.env.example` to `.env`.
2. Set `MONGODB_URI`.
3. Run `npm install`.
4. Run `npm run seed` for development fixture data.
5. Run `npm run dev`.

Default local API: `http://localhost:5001`.

## Seed Note

The seed creates a small development question fixture for Java Fundamentals, DSA with Java and DBMS Core Concepts. It is intentionally not production question content. Production question authoring belongs to the future Admin/Question Bank phase.
