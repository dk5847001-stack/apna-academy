import mongoose from "mongoose";
import crypto from "node:crypto";
import Course from "../models/Course.js";
import Module from "../models/Module.js";
import Video from "../models/Video.js";
import AIKnowledgeChunk from "../models/AIKnowledgeChunk.js";
import { AI_CONFIG } from "../config/ai.js";
import { generateEmbeddings } from "./nvidia.embedding.service.js";

const normalizeText = (value) =>
  String(value || "")
    .replace(/\u0000/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const hashText = (value) => crypto.createHash("sha256").update(value).digest("hex");

const assertObjectId = (value, name) => {
  if (!mongoose.isValidObjectId(value)) {
    const error = new Error(`Invalid ${name}.`);
    error.statusCode = 400;
    error.code = "AI_RAG_INVALID_ID";
    throw error;
  }
};

const hostAllowed = (hostname) => {
  const normalized = hostname.toLowerCase();
  return AI_CONFIG.ragAllowedPdfHosts.some((allowed) => {
    if (allowed.startsWith("*.")) return normalized.endsWith(allowed.slice(1));
    return normalized === allowed;
  });
};

const normalizePdfUrl = (rawUrl) => {
  let url;
  try { url = new URL(String(rawUrl || "").trim()); }
  catch { throw Object.assign(new Error("Invalid PDF URL."), { statusCode: 400, code: "AI_RAG_INVALID_PDF_URL" }); }

  if (url.protocol !== "https:") {
    throw Object.assign(new Error("Course knowledge sources must use HTTPS."), { statusCode: 400, code: "AI_RAG_PDF_HTTPS_REQUIRED" });
  }

  const driveMatch = url.pathname.match(/^\/file\/d\/([^/]+)/i);
  if (driveMatch) {
    return "https://drive.google.com/uc?export=download&id=" + encodeURIComponent(driveMatch[1]);
  }

  if ((url.hostname === "drive.google.com" || url.hostname === "docs.google.com") && url.searchParams.get("id")) {
    return "https://drive.google.com/uc?export=download&id=" + encodeURIComponent(url.searchParams.get("id"));
  }

  if (!hostAllowed(url.hostname)) {
    throw Object.assign(new Error("This PDF host is not allowlisted for AI ingestion."), { statusCode: 400, code: "AI_RAG_PDF_HOST_NOT_ALLOWED" });
  }

  return url.toString();
};

const downloadPdf = async (rawUrl) => {
  const url = normalizePdfUrl(rawUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_CONFIG.timeoutMs);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: { Accept: "application/pdf,application/octet-stream;q=0.9,*/*;q=0.1" },
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = new Error("Unable to download the course PDF.");
      error.statusCode = response.status === 404 ? 404 : 502;
      error.code = "AI_RAG_PDF_DOWNLOAD_FAILED";
      throw error;
    }

    const finalUrl = new URL(response.url || url);
    if (!hostAllowed(finalUrl.hostname) && finalUrl.hostname !== "drive.google.com") {
      throw Object.assign(new Error("PDF redirected to a non-allowlisted host."), { statusCode: 400, code: "AI_RAG_PDF_REDIRECT_NOT_ALLOWED" });
    }

    const contentLength = Number(response.headers.get("content-length") || 0);
    if (contentLength > AI_CONFIG.ragMaxPdfBytes) {
      throw Object.assign(new Error("PDF is larger than the configured ingestion limit."), { statusCode: 413, code: "AI_RAG_PDF_TOO_LARGE" });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > AI_CONFIG.ragMaxPdfBytes) {
      throw Object.assign(new Error("PDF is larger than the configured ingestion limit."), { statusCode: 413, code: "AI_RAG_PDF_TOO_LARGE" });
    }

    if (buffer.length < 5 || buffer.subarray(0, 5).toString() !== "%PDF-") {
      throw Object.assign(new Error("The configured source did not return a valid PDF file."), { statusCode: 422, code: "AI_RAG_NOT_A_PDF" });
    }

    return buffer;
  } finally {
    clearTimeout(timeout);
  }
};

const splitText = (text) => {
  const clean = normalizeText(text);
  if (!clean) return [];

  const chunks = [];
  const size = AI_CONFIG.ragChunkChars;
  const overlap = Math.min(AI_CONFIG.ragChunkOverlapChars, Math.floor(size / 2));

  let start = 0;
  while (start < clean.length) {
    let end = Math.min(clean.length, start + size);
    if (end < clean.length) {
      const boundary = clean.lastIndexOf(" ", end);
      if (boundary > start + Math.floor(size * 0.6)) end = boundary;
    }

    const chunk = clean.slice(start, end).trim();
    if (chunk.length >= 40) chunks.push(chunk);
    if (end >= clean.length) break;

    const nextStart = Math.max(0, end - overlap);
    if (nextStart <= start) break;
    start = nextStart;
  }

  return chunks;
};

const extractPdfText = async (buffer) => {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return normalizeText(result?.text || "");
  } finally {
    await parser.destroy();
  }
};

const addSourceChunks = (sources, source) => {
  const text = normalizeText(source.text);
  if (!text) return;
  for (const chunk of splitText(text)) {
    sources.push({
      course: source.course,
      module: source.module || null,
      video: source.video || null,
      sourceType: source.sourceType,
      sourceUrl: source.sourceUrl || "",
      sourceTitle: source.sourceTitle || "",
      page: null,
      text: chunk,
    });
  }
};

const embedInBatches = async (chunks) => {
  const result = [];
  for (let start = 0; start < chunks.length; start += AI_CONFIG.ragEmbeddingBatchSize) {
    const batch = chunks.slice(start, start + AI_CONFIG.ragEmbeddingBatchSize);
    const vectors = await generateEmbeddings(batch.map((item) => item.text), "passage");
    result.push(...vectors);
  }
  return result;
};

export const indexCourseKnowledge = async (courseId) => {
  assertObjectId(courseId, "course id");
  if (!AI_CONFIG.ragEnabled) {
    const error = new Error("AI RAG is disabled.");
    error.statusCode = 503;
    error.code = "AI_RAG_DISABLED";
    throw error;
  }

  const course = await Course.findOne({ _id: courseId, isPublished: true }).lean();
  if (!course) {
    const error = new Error("Published course not found.");
    error.statusCode = 404;
    error.code = "AI_RAG_COURSE_NOT_FOUND";
    throw error;
  }

  const modules = await Module.find({ course: course._id, isPublished: true }).sort({ order: 1 }).lean();
  const videos = await Video.find({ course: course._id, isPublished: true }).sort({ module: 1, order: 1 }).lean();

  const sources = [];

  addSourceChunks(sources, {
    course: course._id,
    sourceType: "course",
    sourceTitle: course.title,
    text: [course.title, course.shortDescription, course.description, (course.tags || []).join(", ")].filter(Boolean).join("\n"),
  });

  for (const module of modules) {
    addSourceChunks(sources, {
      course: course._id,
      module: module._id,
      sourceType: "module",
      sourceTitle: module.title,
      text: [module.title, module.description].filter(Boolean).join("\n"),
    });
  }

  for (const video of videos) {
    addSourceChunks(sources, {
      course: course._id,
      module: video.module,
      video: video._id,
      sourceType: "lesson-notes",
      sourceUrl: video.notesPdfUrl || "",
      sourceTitle: video.title,
      text: [video.title, video.description].filter(Boolean).join("\n"),
    });

    if (video.notesPdfUrl) {
      const pdfText = await extractPdfText(await downloadPdf(video.notesPdfUrl));
      addSourceChunks(sources, {
        course: course._id,
        module: video.module,
        video: video._id,
        sourceType: "lesson-notes",
        sourceUrl: video.notesPdfUrl,
        sourceTitle: video.title + " — lesson notes",
        text: pdfText,
      });
    }
  }

  if (course.previewSyllabusPdfUrl) {
    const syllabusText = await extractPdfText(await downloadPdf(course.previewSyllabusPdfUrl));
    addSourceChunks(sources, {
      course: course._id,
      sourceType: "syllabus",
      sourceUrl: course.previewSyllabusPdfUrl,
      sourceTitle: course.title + " — syllabus",
      text: syllabusText,
    });
  }

  if (sources.length === 0) {
    const error = new Error("No indexable course content was found.");
    error.statusCode = 422;
    error.code = "AI_RAG_NO_CONTENT";
    throw error;
  }

  const vectors = await embedInBatches(sources);
  const documents = sources.map((source, index) => ({
    ...source,
    chunkIndex: index,
    embedding: vectors[index],
    embeddingModel: AI_CONFIG.embeddingModel,
    contentHash: hashText(source.text),
  }));

  await AIKnowledgeChunk.deleteMany({ course: course._id });
  await AIKnowledgeChunk.insertMany(documents, { ordered: true });

  return {
    courseId: course._id,
    courseTitle: course.title,
    chunksIndexed: documents.length,
    embeddingModel: AI_CONFIG.embeddingModel,
    embeddingDimensions: AI_CONFIG.embeddingDimensions,
    sourceCounts: documents.reduce((counts, item) => {
      counts[item.sourceType] = (counts[item.sourceType] || 0) + 1;
      return counts;
    }, {}),
  };
};

const dotProduct = (a, b) => {
  let score = 0;
  const length = Math.min(a.length, b.length);
  for (let index = 0; index < length; index += 1) score += a[index] * b[index];
  return score;
};

const vectorSearch = async (courseId, queryVector, allowedModuleIds = []) => {
  const limit = AI_CONFIG.ragTopK;
  const candidates = Math.min(10000, Math.max(limit * 20, 100));

  const rows = await AIKnowledgeChunk.aggregate([
    {
      $vectorSearch: {
        index: AI_CONFIG.ragVectorIndexName,
        path: "embedding",
        queryVector,
        numCandidates: candidates,
        limit,
        filter: { $and: [\n          { course: new mongoose.Types.ObjectId(courseId) },\n          { module: { $in: [null, ...allowedModuleIds.map((id) => new mongoose.Types.ObjectId(id))] } },\n        ] },
      },
    },
    { $project: { text: 1, sourceType: 1, sourceTitle: 1, sourceUrl: 1, page: 1, module: 1, video: 1, score: { $meta: "vectorSearchScore" } } },
  ]);

  return rows;
};

export const retrieveCourseKnowledge = async ({ courseId, query, allowedModuleIds = [] }) => {
  assertObjectId(courseId, "course id");
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return [];
  const queryVector = (await generateEmbeddings([normalizedQuery], "query"))[0];

  if (AI_CONFIG.ragUseVectorSearch) {
    try {
      return await vectorSearch(courseId, queryVector, allowedModuleIds);
    } catch (error) {
      // Keep the feature usable on small/free MongoDB deployments without
      // Vector Search enabled. Production can turn this on after the index is ready.
      if (error?.code !== "AI_RAG_VECTOR_SEARCH_UNAVAILABLE") {
        // Intentionally fall through to exact cosine retrieval.
      }
    }
  }

  const chunks = await AIKnowledgeChunk.find({\n    course: courseId,\n    module: { $in: [null, ...allowedModuleIds] },\n  })
    .select("text sourceType sourceTitle sourceUrl page module video embedding")
    .limit(10000)
    .lean();

  return chunks
    .map((chunk) => ({ ...chunk, score: dotProduct(queryVector, chunk.embedding || []) }))
    .filter((chunk) => Number.isFinite(chunk.score))
    .sort((a, b) => b.score - a.score)
    .slice(0, AI_CONFIG.ragTopK);
};

export const buildRagContext = (chunks) => {
  const selected = [];
  let total = 0;
  for (const chunk of chunks) {
    const label = [chunk.sourceTitle, chunk.page ? "page " + chunk.page : null].filter(Boolean).join(" · ");
    const block = "[SOURCE: " + label + "]\n" + chunk.text;
    if (total + block.length > AI_CONFIG.ragMaxContextChars) break;
    selected.push(block);
    total += block.length;
  }
  return selected.join("\n\n");
};
