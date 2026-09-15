import "node:process";
import http from "node:http";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { isValidJob, enqueueJob } from "./worker.js";

const PORT = Number(process.env.PORT || 6000);
const JUDGE_SERVICE_SECRET = process.env.JUDGE_SERVICE_SECRET?.trim();

if (!JUDGE_SERVICE_SECRET) {
  throw new Error("JUDGE_SERVICE_SECRET is required.");
}

const sendJson = (res, status, payload) => {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(payload));
};

const readJson = async (req) => {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 2_000_000) throw Object.assign(new Error("Request body too large."), { statusCode: 413 });
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw Object.assign(new Error("Invalid JSON."), { statusCode: 400 }); }
};

const authorized = (req) => {
  const value = req.headers["x-judge-secret"];
  if (typeof value !== "string") return false;
  const expected = Buffer.from(JUDGE_SERVICE_SECRET, "utf8");
  const received = Buffer.from(value, "utf8");
  return expected.length === received.length && timingSafeEqual(expected, received);
};

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/health") return sendJson(res, 200, { ok: true, service: "dsa-judge-worker" });
    if (req.method !== "POST" || req.url !== "/v1/jobs") return sendJson(res, 404, { success: false, message: "Not found." });
    if (!authorized(req)) return sendJson(res, 401, { success: false, message: "Unauthorized." });

    const job = await readJson(req);
    if (!isValidJob(job)) return sendJson(res, 400, { success: false, message: "Invalid judge job." });

    const jobId = randomUUID();
    enqueueJob({ ...job, jobId }).catch((error) => console.error("Judge job failed:", error.message));
    return sendJson(res, 202, { success: true, jobId, status: "Pending" });
  } catch (error) {
    return sendJson(res, error.statusCode || 500, { success: false, message: error.message || "Internal judge error." });
  }
});

server.listen(PORT, "0.0.0.0", () => console.log(`DSA Judge Worker listening on :${PORT}`));
