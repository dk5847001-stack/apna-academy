# ApnaAcademy AI — Phase 6: Course RAG

Phase 6 makes the verified student's AI assistant course-aware. It indexes published course descriptions, modules, lesson metadata, lesson-note PDFs, and the published syllabus PDF into a private course knowledge collection.

## Architecture

```
Admin
  -> POST /api/v1/admin/ai/courses/:courseId/index
  -> fetch approved HTTPS PDF sources
  -> extract PDF text
  -> normalize + chunk
  -> NVIDIA Nemotron-3-Embed-1B (passage)
  -> MongoDB AIKnowledgeChunk

Verified student
  -> create conversation with courseId
  -> backend verifies active purchase
  -> user question -> NVIDIA embedding (query)
  -> course-only semantic retrieval
  -> retrieved context -> NVIDIA chat completion
  -> answer
```

NVIDIA's hosted embeddings endpoint is OpenAI-compatible at `/v1/embeddings`. Nemotron-3-Embed-1B uses separate `passage` and `query` modes; the implementation uses passage mode during indexing and query mode during retrieval.

## Security boundary

Course-specific knowledge is never selected from a frontend-supplied list of documents.

1. The conversation stores a server-side `course` ObjectId.
2. Creating a course conversation requires an active paid purchase for that user/course.
3. Every course-specific message checks the active purchase again.
4. Retrieval always filters by that conversation's course.
5. Guest AI has no RAG access.
6. A client cannot provide another user's `userId`.
7. PDF ingestion is admin-only.
8. Provider credentials remain server-side.

If a purchase is refunded or expires, course-specific AI returns `403 AI_COURSE_ACCESS_REVOKED`.

## Indexed sources

- Course title, description, short description and tags
- Published module titles/descriptions
- Published lesson titles/descriptions
- Published lesson `notesPdfUrl` PDFs
- Published course `previewSyllabusPdfUrl`

The existing video URL/media is never indexed as knowledge.

## PDF security

Admin ingestion only accepts HTTPS sources on the configured host allowlist.

Default hosts:

- `drive.google.com`
- `docs.google.com`
- `drive.usercontent.google.com`
- `storage.googleapis.com`

Google Drive `/file/d/<id>/view` URLs are converted to a download URL before fetching.

Limits:

- 25 MB per PDF by default
- PDF magic-header validation
- redirect host validation
- request timeout
- no arbitrary HTTP/internal-host fetching

Add a trusted PDF host explicitly through `AI_RAG_ALLOWED_PDF_HOSTS` if ApnaAcademy stores notes on another HTTPS domain.

## API

### Admin indexing

`POST /api/v1/admin/ai/courses/:courseId/index`

Requires authenticated admin access.

The operation builds a fresh course index only after extraction and embedding succeed, then replaces the existing course chunks.

### Course conversation

Existing Phase 5 endpoints remain:

- `GET /api/v1/ai/conversations?courseId=<courseId>`
- `POST /api/v1/ai/conversations` with `{ "title": "...", "courseId": "..." }`
- `GET /api/v1/ai/conversations/:conversationId/messages`
- `POST /api/v1/ai/conversations/:conversationId/messages`

Generic conversations without `courseId` remain supported and do not receive private course context.

## Embeddings

Default model:

`nvidia/nemotron-3-embed-1b`

Default dimension: `2048`

The same embedding model and dimension must be used for both indexing and querying. Switching the embedding model requires re-indexing the course corpus.

NVIDIA's current documentation lists Nemotron-3-Embed-1B as a supported embedding model and documents `passage` vs `query` input modes.

## Retrieval

The service first supports MongoDB Atlas Vector Search when:

`AI_RAG_USE_VECTOR_SEARCH=true`

and the configured index exists.

Recommended index:

- collection: `aiknowledgechunks`
- name: `ai_knowledge_embedding`
- field: `embedding`
- dimensions: `2048`
- similarity: `cosine`
- filter field: `course`

Example Atlas Vector Search index definition:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 2048,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "course"
    }
  ]
}
```

For the current small 5–10 student deployment, the default is `AI_RAG_USE_VECTOR_SEARCH=false`. The backend uses normalized embeddings and an exact cosine/dot-product fallback. This avoids requiring a paid/dedicated search setup immediately.

When moving to a larger production corpus, enable the Atlas Vector Search index and set `AI_RAG_USE_VECTOR_SEARCH=true`.

## Environment

```env
AI_RAG_ENABLED=true

NVIDIA_EMBEDDING_API_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_EMBEDDING_MODEL=nvidia/nemotron-3-embed-1b
AI_RAG_EMBEDDING_DIMENSIONS=2048

AI_RAG_CHUNK_CHARS=1400
AI_RAG_CHUNK_OVERLAP_CHARS=220
AI_RAG_TOP_K=6
AI_RAG_MAX_CONTEXT_CHARS=9000
AI_RAG_MAX_PDF_BYTES=26214400
AI_RAG_EMBEDDING_BATCH_SIZE=16

AI_RAG_VECTOR_INDEX_NAME=ai_knowledge_embedding
AI_RAG_USE_VECTOR_SEARCH=false

AI_RAG_ALLOWED_PDF_HOSTS=drive.google.com,docs.google.com,drive.usercontent.google.com,storage.googleapis.com
```

The NVIDIA API key is the same server-side `NVIDIA_NIM_API_KEY` already used by Phase 1–5.

## Deployment order

1. Deploy backend with the Phase 6 code and dependencies.
2. Set the Phase 6 environment variables.
3. Confirm `AI_ENABLED=true`, `AI_RAG_ENABLED=true`, `NVIDIA_NIM_API_KEY`, and `NVIDIA_MODEL`.
4. Open the Admin application with an admin account.
5. Trigger the course indexing endpoint for each published course.
6. Confirm the returned `chunksIndexed` value is greater than zero.
7. Open the Course application as a purchased, verified student.
8. Open **Ask Course AI**.
9. Ask a question that is answered by the lesson notes.
10. Confirm the response is course-specific.
11. Test a non-purchased course with the same account; course-specific conversation creation must return 403.
12. After a MongoDB Vector Search index is ready, enable `AI_RAG_USE_VECTOR_SEARCH=true` and re-test retrieval.

## Important limitation

This phase extracts machine-readable PDF text. Image-only/scanned PDFs without a text layer will not produce useful chunks. OCR/multimodal document parsing is intentionally a later enhancement.

## Current MongoDB strategy

For the initial small student count, exact cosine retrieval is deliberate: it works without requiring a separate vector-search service. MongoDB Atlas Vector Search is wired as the scale-up path, with a course pre-filter so one course's chunks cannot leak into another course's retrieval.
