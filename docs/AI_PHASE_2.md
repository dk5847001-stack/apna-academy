# ApnaAcademy AI Assistant — Phase 2

## Public / Guest AI

Phase 2 adds constrained public AI while keeping NVIDIA credentials and private course knowledge on the backend.

### Public API
- GET /api/v1/ai/public/status
- POST /api/v1/ai/public/chat

### Default guest limits
- 5 requests per IP in a rolling 24-hour application bucket.
- 3 requests per minute per IP.
- 2,500 total input characters per request.
- 4 messages maximum.
- 512 generated tokens maximum.
- No private course/RAG context.
- No conversation persistence.
- No provider credentials exposed to the browser.

The limiter is intentionally an application-side control. It uses process memory for the current low-volume deployment. Before running multiple backend instances, move these counters to a shared store such as Redis so limits remain global across instances.

### Security
Frontend limits are not trusted. The backend validates the body and rate-limits before calling NVIDIA. Public users cannot supply model/provider credentials or private course context.

### Environment overrides
AI_GUEST_DAILY_REQUESTS=5
AI_GUEST_WINDOW_MS=60000
AI_GUEST_WINDOW_REQUESTS=3
AI_GUEST_MAX_INPUT_CHARS=2500
AI_GUEST_MAX_OUTPUT_TOKENS=512
AI_GUEST_MAX_MESSAGES=4
