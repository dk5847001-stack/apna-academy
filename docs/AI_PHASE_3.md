# ApnaAcademy AI — Phase 3: Authentication & Security

Phase 3 hardens authenticated AI access without changing existing course, payment, learning, certificate, or video flows.

## Authenticated AI policy

Authenticated AI requests require:
- Valid ApnaAcademy authentication/session.
- Active user account.
- Verified email address.
- Server-side NVIDIA credentials only.
- Per-user and per-IP rate limiting.
- Per-user and per-IP concurrent-request limits.
- Existing request/message/context validation.
- No client-controlled provider/model/key selection.

## Default authenticated limits

- 10 AI requests per rolling minute per user.
- 10 AI requests per rolling minute per client IP.
- 100 AI requests per rolling 24 hours per user.
- 2 simultaneous AI requests per user.
- 3 simultaneous AI requests per client IP.

The current limiter is process-local memory. It resets on restart and is not shared across multiple backend instances. Before horizontal scaling, move these counters to a shared store such as Redis.

## Guest policy

Guest controls from Phase 2 remain unchanged.

## Security notes

- Never expose NVIDIA_NIM_API_KEY or provider credentials to React.
- Never trust frontend rate-limit counters.
- The authenticated AI endpoint accepts only user/assistant messages; system messages cannot be supplied by the client.
- AI access is tied to the already validated active session.
- Email verification is required before authenticated AI access.
- 429 responses include Retry-After.

## Environment variables

Add/update:

AI_AUTH_WINDOW_MS=60000
AI_AUTH_WINDOW_REQUESTS=10
AI_AUTH_DAILY_REQUESTS=100
AI_AUTH_DAILY_WINDOW_MS=86400000
AI_AUTH_MAX_CONCURRENT_USER=2
AI_AUTH_MAX_CONCURRENT_IP=3

## Verification checklist

1. Unauthenticated POST /api/v1/ai/chat → 401.
2. Authenticated but unverified user → 403 AI_EMAIL_VERIFICATION_REQUIRED.
3. Active verified user → provider request proceeds.
4. Minute limit exceeded → 429.
5. Daily limit exceeded → 429.
6. Concurrent limit exceeded → 429.
7. Guest routes remain public and retain Phase 2 controls.
8. Existing authenticated AI endpoint still returns provider output.
