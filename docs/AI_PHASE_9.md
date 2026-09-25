# ApnaAcademy AI — Phase 9: Analytics & Usage

Phase 9 adds privacy-conscious AI usage telemetry and operational analytics.

## What is tracked

Each successful AI provider request records:
- authenticated user when available
- course/conversation scope when available
- feature type
- guest/user/admin audience
- provider/model
- request character count
- provider-reported input/output/total tokens when available
- latency
- success/failure status and normalized error code

RAG embedding requests are also tracked as embedding events.

## What is deliberately not tracked

Prompt text, retrieved course text, submitted source code, AI responses, API keys, cookies, authentication tokens, and raw client IP addresses are not stored in the usage event.

## APIs

Student: GET /api/v1/ai/usage/me?preset=30d

Supported presets: 1d, 7d, 30d, 90d, 180d.

Admin: GET /api/v1/admin/ai/usage?preset=30d

Optional admin filters: from=YYYY-MM-DD&to=YYYY-MM-DD, courseId=<courseId>, feature=<feature>.

The admin response includes request totals, success/failure, token totals, latency, feature usage, course usage, provider/model usage, daily usage, and top users.

## Admin UI

The existing Analytics dashboard now includes an AI Usage & Health panel with request/success/failure counts, token totals, success rate, average provider latency, model/provider, feature usage, course AI usage, and selected/custom period support.

## Accuracy and cost

Token counts are provider-reported when NVIDIA returns usage metadata. Missing usage metadata is stored as zero; it is not estimated.

No monetary cost is invented in this phase because provider/model pricing can change and the application does not have a configured pricing table. Token usage is the source of truth exposed by the dashboard.

## Reliability

Telemetry writes are best-effort. If MongoDB telemetry insertion fails, the AI request continues normally.

## Acceptance tests

1. Successful authenticated chat creates one usage event.
2. Guest chat creates a guest usage event without a user ID.
3. Course chat stores course/conversation scope without storing message content.
4. Phase 8 learning features record their individual feature types.
5. RAG embedding requests are recorded without storing prompt/course text.
6. Provider failure records a failed chat event where the failure occurs inside askAI.
7. Student usage endpoint cannot access another user's data.
8. Admin usage endpoint requires an active admin account.
9. Usage analytics contain no prompt, response, cookie, API key, or raw IP data.
10. Telemetry persistence failure does not fail the underlying AI request.
