# ApnaAcademy AI — Phase 7: Course Authorization

Phase 7 hardens the boundary between a purchased course and its private AI knowledge.

## Authorization contract

A verified authenticated user can use Course AI only when:
1. The course exists and is published.
2. The user has an active paid purchase for that course.
3. The purchase has not expired.
4. The conversation belongs to that same user and course.
5. The requested knowledge belongs to the currently unlocked part of that course.

The backend is the source of truth. Frontend course locks, route parameters, or client state are never authorization.

## Module unlock enforcement

ApnaAcademy already supports purchase-time module unlocking.

Phase 7 applies that same rule to RAG:
- all_access purchase: all published module knowledge is available.
- Daily/unlock-by-day purchase: only currently unlocked module notes are available.
- Course-level metadata and syllabus chunks have module=null and remain available to a purchaser.
- Locked module/lesson-note chunks are excluded before semantic retrieval.

This prevents Course AI from becoming a side channel for locked lessons.

## API

GET /api/v1/ai/courses/:courseId/access

Requires an authenticated, active, verified user with an active course purchase.

Successful response contains only safe metadata:
- course ID/title
- unlocked module count
- published module count
- unlock mode

Purchase IDs, payment records and private purchase fields are not returned.

Existing course-aware conversation calls now re-check entitlement server-side:
- GET /api/v1/ai/conversations?courseId=<courseId>
- POST /api/v1/ai/conversations with courseId
- GET /api/v1/ai/conversations/:conversationId/messages
- POST /api/v1/ai/conversations/:conversationId/messages
- PATCH /api/v1/ai/conversations/:conversationId

Deleting/archiving a conversation remains available through the user's own conversation ownership check.

## Retrieval boundary

The retrieval service receives allowedModuleIds from the server-side entitlement service.

MongoDB Atlas Vector Search applies:
- course == conversation.course
- module == null OR module IN allowedModuleIds

The exact cosine fallback applies the identical scope before calculating similarity.

MongoDB documents Vector Search pre-filtering and support for $in/logical operators:
https://www.mongodb.com/docs/vector-search/query/aggregation-stages/vector-search-stage/

The Atlas index must include course and module as filter fields in addition to the embedding field.

## Revocation behavior

Every course-specific message checks the active purchase again.

If a purchase expires, is not paid, or is otherwise no longer active:
- new course AI messages return HTTP 403
- course conversation history returns HTTP 403
- course conversation listing returns HTTP 403
- course conversation rename returns HTTP 403

The user can still archive/delete their own conversation.

## Security properties

- No client-provided user ID is trusted.
- Conversation ownership is always scoped to the authenticated user.
- Course access is resolved from MongoDB.
- Purchase expiry is checked server-side.
- Locked module IDs cannot be supplied by the client to expand retrieval scope.
- RAG never accepts arbitrary document/chunk IDs from the frontend.
- Guest AI has no course RAG access.
- Admin indexing is separate from student authorization.
- Private purchase fields are not returned by the access endpoint.

## Atlas Vector Search index

Recommended fields:
- embedding vector, 2048 dimensions, cosine
- course filter
- module filter

Keep AI_RAG_USE_VECTOR_SEARCH=false until the Atlas index has been created and verified.

## Acceptance tests

1. Verified purchaser with all-access purchase asks about any published lesson: allowed.
2. Verified purchaser with daily unlock purchase asks about an unlocked lesson: allowed.
3. Same purchaser asks about a locked lesson: locked lesson chunks are not retrieved.
4. User without purchase calls course access endpoint: 403.
5. User without purchase creates course conversation: 403.
6. User with an expired purchase sends a message to an old course conversation: 403.
7. User attempts to read another user's conversation: 404.
8. Client cannot substitute a different course ID for an existing conversation because conversation.course is authoritative.
9. Guest calls course conversation endpoints: authentication/verification protection blocks access.
10. Unpublished course: course AI access is unavailable.
11. Course RAG disabled: course conversation creation is unavailable.
12. Vector Search disabled: exact retrieval applies the same module authorization filter.

## Phase 6 relationship

Phase 6 introduced Course RAG and basic purchase checking. Phase 7 makes authorization a dedicated backend policy and extends it to every course-AI operation and every retrieval path, including module-level unlocking.
