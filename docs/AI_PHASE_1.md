# ApnaAcademy AI Assistant — Phase 1

## Scope

Phase 1 establishes the server-side NVIDIA AI foundation without exposing the provider key to the browser.

### Included

- Configurable NVIDIA API base URL and model.
- Server-side NVIDIA bearer-token authentication.
- Non-streaming chat completion service.
- AbortController timeout.
- Provider error normalization.
- Input validation and bounded context size.
- Authenticated AI routes.
- AI configuration status endpoint.
- NVIDIA model-list endpoint for configuration verification.

### API

Base API prefix: /api/v1

- GET /ai/status
- GET /ai/provider/models
- POST /ai/chat

Phase 1 intentionally keeps these routes authenticated. Guest access, dedicated guest quotas, conversation persistence, streaming UI, course RAG, and course entitlement checks are later phases.

## Environment

Add these variables to the Backend deployment environment:

AI_ENABLED=true
NVIDIA_NIM_API_KEY=<your-new-NVIDIA-key>
NVIDIA_API_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=<model-id-from-NVIDIA>
NVIDIA_TIMEOUT_MS=30000
AI_MAX_INPUT_CHARS=6000
AI_MAX_OUTPUT_TOKENS=1024
AI_TEMPERATURE=0.2

Never place NVIDIA_NIM_API_KEY in Frontend, Course, Admin, DSA, source code, Git history, or a Vite VITE_* variable.

## Verification

After deployment, authenticate to ApnaAcademy and call:

GET /api/v1/ai/status

Expected response contains enabled=true, provider=nvidia, modelConfigured=true, and apiKeyConfigured=true.

Then verify the provider connection with:

GET /api/v1/ai/provider/models

Finally test:

POST /api/v1/ai/chat
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "Explain a Java array in simple words."
    }
  ]
}

Do not paste the NVIDIA API key into chat or commit it to GitHub.

## NVIDIA API notes

NVIDIA documents an OpenAI-compatible /v1/chat/completions interface and /v1/models model discovery. The application therefore keeps the model ID configurable instead of hardcoding a model that may later be unavailable to the account.

If NVIDIA returns 401/403, verify the key and that the account has permission to use the public API endpoint/model.
