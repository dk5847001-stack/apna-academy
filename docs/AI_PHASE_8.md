# ApnaAcademy AI — Phase 8: Learning Features

Phase 8 adds learning workflows on top of Phase 7 course-AI authorization.

## Features
- Topic explanation
- Authorized lesson/module summaries
- AI-generated practice quizzes
- Personalized study plans
- Code review
- Existing course RAG grounding

## Security contract
Every endpoint requires authentication, an active user, verified email, a published course, and an active course purchase. When moduleId or videoId is supplied, the server verifies that the requested published scope belongs to the course and is currently unlocked.

The server never treats moduleId/videoId as permission grants. Locked content is excluded from retrieval.

## API
POST /api/v1/ai/learning/courses/:courseId/explain
Body: { topic, level?, moduleId?, videoId? }

POST /api/v1/ai/learning/courses/:courseId/summarize
Body: { moduleId?, videoId? }
A module or video scope is required.

POST /api/v1/ai/learning/courses/:courseId/quiz
Body: { count?, difficulty?, moduleId?, videoId? }
Returns temporary practice questions. It does not modify official assessment attempts, progress, certificates, or scores.

POST /api/v1/ai/learning/courses/:courseId/study-plan
Body: { goals?, days?, dailyMinutes? }
Only currently authorized course context is used.

POST /api/v1/ai/learning/courses/:courseId/code-review
Body: { language?, code, question?, moduleId?, videoId? }
Submitted code is never executed by this feature.

## Acceptance tests
1. Verified purchaser can explain an authorized topic.
2. Unpurchased user receives 403.
3. Locked module summary receives 403.
4. Locked lesson code-review scope receives 403.
5. Unpublished module/video receives 404.
6. Practice quiz returns exactly the requested number of four-option questions.
7. Practice quiz does not create an AssessmentAttempt.
8. Study plan uses only currently authorized course context.
9. RAG disabled returns 503.
10. Provider failure does not mutate purchase, progress, assessment, or certificate state.
