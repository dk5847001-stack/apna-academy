# ApnaAcademy AI — Phase 10: Production QA & Hardening

Phase 10 is the production-readiness gate for the AI stack built in Phases 1–9.

## Security hardening covered

- Server-side NVIDIA credentials only.
- HTTPS validation for NVIDIA chat and embedding base URLs.
- Guest burst + daily rate limiting.
- Authenticated per-user, per-IP, and daily limits.
- Per-user/IP AI concurrency limits.
- Active + verified-user requirement for authenticated AI.
- Course purchase/expiry authorization rechecked on every private course-AI operation.
- Locked module filtering applied before RAG similarity results are returned.
- RAG PDF HTTPS/host allowlist, redirect validation, size limit, and PDF magic-header validation.
- Usage telemetry excludes prompts, responses, submitted code, cookies, auth tokens, raw IPs, and API keys.
- Analytics persistence is best-effort and cannot break an AI response.
- Legacy AI chat endpoint remains available for compatibility.

## Automated static QA

Run from repository root:

    node scripts/ai-phase10-qa.mjs

The script verifies required AI files, security contracts, route registration, authorization hooks, RAG filtering, telemetry privacy, secret-like values in AI source/docs, and Node syntax for the backend AI modules.

It does not call NVIDIA and does not require production credentials.

## Application builds

The Phase 10 CI workflow runs:

1. Backend dependency installation + static AI QA.
2. Frontend dependency installation + production build + PWA validation.
3. Course dependency installation + production build.
4. Admin dependency installation + production build.

The CI workflow is the repeatable regression gate for the four application surfaces.

## Production smoke checklist

Before enabling AI in production:

1. Set a fresh NVIDIA API key only in the backend/Render environment.
2. Set AI_ENABLED=true and NVIDIA_MODEL.
3. If RAG is enabled, configure the embedding model and RAG variables.
4. Confirm /api/v1/ai/public/status does not expose credentials.
5. Confirm guest requests receive 429 after configured daily/burst limits.
6. Confirm unverified users cannot use authenticated AI.
7. Confirm a purchased course can use Course AI only for currently unlocked modules.
8. Confirm a non-purchaser receives 403 for course-specific AI.
9. Confirm expired purchases cannot use private Course AI.
10. Confirm an admin can view AI usage analytics without prompt/response content.
11. Confirm provider failures return normalized API errors and create failed usage telemetry where the failure occurs inside the AI service.
12. Confirm RAG indexing rejects non-HTTPS, non-allowlisted, oversized, or non-PDF sources.

## Acceptance criteria

Phase 10 is considered complete when:

- The static QA script passes.
- All four app surfaces have production build checks in CI.
- No AI secret is committed.
- Course authorization is enforced server-side.
- RAG retrieval is scoped to entitlement/unlocked modules.
- AI analytics remain privacy-conscious and non-blocking.
- The remaining production smoke checks are verified against the deployed environment with real credentials by the operator.

## Important limitation

The repository does not currently have an automated integration-test runner. Phase 10 therefore adds deterministic static/security QA and build CI rather than pretending that live payment, MongoDB, NVIDIA, or production user flows were executed.
