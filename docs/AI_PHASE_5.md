# ApnaAcademy AI — Phase 5: Conversation Memory

## Scope

Phase 5 adds authenticated, server-side AI conversation memory. Guest AI remains stateless and local to the browser.

### Data model

- `AIConversation`: owner, title, message count, last message time, archive state.
- `AIMessage`: owner, conversation, role, content, sequence and provider model snapshot.
- Every query is scoped by the authenticated user's ID. A client cannot supply an owner ID.

### API

All endpoints below require the existing authenticated + verified AI policy.

- `GET /api/v1/ai/conversations`
- `POST /api/v1/ai/conversations`
- `GET /api/v1/ai/conversations/:conversationId/messages`
- `POST /api/v1/ai/conversations/:conversationId/messages`
- `PATCH /api/v1/ai/conversations/:conversationId`
- `DELETE /api/v1/ai/conversations/:conversationId` (soft archive)

The message endpoint accepts one user message. The backend loads recent server-side history and calls NVIDIA through the existing AI service. The client does not submit the conversation history and cannot choose another user's conversation.

### Limits

- 200 stored messages per conversation.
- 20 recent messages sent to the model.
- User message max follows `AI_MAX_INPUT_CHARS` (default 6,000).
- Conversation title max 120 characters.
- List endpoint max 50 conversations.
- Message history endpoint max 200 messages.

### Security

- Authentication and email verification are required.
- Ownership is checked on every conversation operation.
- Guest conversations are never written to MongoDB.
- Provider credentials remain server-side.
- Existing per-user/IP rate and concurrency limits are applied to generation.
- Invalid conversation IDs return 400; missing/not-owned conversations return 404.
- A failed provider call removes the newly stored user message so an unsuccessful turn is not left as a partial conversation.

## Important Phase 5 design decision

The existing legacy `POST /api/v1/ai/chat` endpoint is intentionally preserved for compatibility. Phase 5's persistent client should use the conversation endpoints. RAG and course-specific authorization remain later phases.
