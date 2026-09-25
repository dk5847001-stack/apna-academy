# ApnaAcademy AI — Phase 4 Premium Chat UI

Phase 4 adds the production-facing React AI assistant UI on top of the Phase 2 public endpoint and Phase 3 authenticated endpoint.

## User experience
- Floating Ask AI launcher.
- Responsive desktop/mobile chat panel.
- Public guest mode for visitors.
- Authenticated mode for active verified users.
- Conversation persistence in browser localStorage.
- Conversation capped at 40 rendered messages.
- Starter prompts.
- Enter to send; Shift+Enter for a new line.
- Character counter matching backend limits.
- Loading/typing indicator.
- Stop button using AbortController.
- Retry after an AI failure.
- Clear conversation.
- Code-fence rendering.
- Accessible labels and disabled states.
- Backend remains the source of truth for authentication and rate limits.

## Endpoint selection
The UI never calls NVIDIA directly.
- Verified active user -> /api/v1/ai/chat
- Guest/unverified user -> /api/v1/ai/public/chat
- Availability -> /api/v1/ai/public/status

The NVIDIA API key is never included in frontend code.

## Accurate streaming behavior
Phase 4 does not claim token-by-token streaming because the current backend provider integration uses a non-streaming chat completion request. The UI therefore shows a thinking/loading state and supports cancellation of the HTTP request. True SSE/token streaming should be implemented as a separate backend and frontend phase.

## Browser storage
The conversation is stored locally under apnaacademy_ai_chat_v1. It is not secure server-side memory and must not be used for private course authorization. Server-side conversation persistence belongs to the conversation-memory phase.