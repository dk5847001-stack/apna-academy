import "node:process";
import http from "node:http";
import { randomUUID, timingSafeEqual } from "node:crypto";
import {
  checkDockerRuntime,
  enqueueJob,
  getQueueStats,
  isAcceptingJobs,
  isValidJob,
  stopAcceptingJobs,
  waitForIdle,
} from "./worker.js";

const PORT = Number(process.env.PORT || 6000);
const JUDGE_SERVICE_SECRET = process.env.JUDGE_SERVICE_SECRET?.trim();
const SHUTDOWN_GRACE_MS = (() => {
  const value = Number(process.env.JUDGE_SHUTDOWN_GRACE_MS || 30000);
  return Number.isFinite(value) ? Math.min(120000, Math.max(5000, Math.floor(value))) : 30000;
})();

if (!JUDGE_SERVICE_SECRET) throw new Error("JUDGE_SERVICE_SECRET is required.");

let shuttingDown = false;
let dockerReady = false;

const log = (level, event, fields = {}) => {
  const entry = { timestamp: new Date().toISOString(), level, service: "dsa-judge-worker", event, ...fields };
  console[level === "error" ? "error" : "log"](JSON.stringify(entry));
};

const sendJson = (res, status, payload) => {
  if (res.headersSent) return;
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
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
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw Object.assign(new Error("Invalid JSON."), { statusCode: 400 });
  }
};

const authorized = (req) => {
  const value = req.headers["x-judge-secret"];
  if (typeof value !== "string") return false;
  const expected = Buffer.from(JUDGE_SERVICE_SECRET, "utf8");
  const received = Buffer.from(value, "utf8");
  return expected.length === received.length && timingSafeEqual(expected, received);
};

const refreshDockerReadiness = async () => {
  const result = await checkDockerRuntime();
  dockerReady = result.ok;
  if (!result.ok) log("error", "docker_unavailable", { message: result.message });
  return result;
};

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/health") {
      return sendJson(res, 200, { ok: true, service: "dsa-judge-worker", shuttingDown });
    }

    if (req.method === "GET" && req.url === "/ready") {
      const stats = getQueueStats();
      const ready = !shuttingDown && dockerReady && isAcceptingJobs();
      return sendJson(res, ready ? 200 : 503, {
        ok: ready,
        service: "dsa-judge-worker",
        docker: dockerReady,
        acceptingJobs: isAcceptingJobs(),
        queue: stats,
      });
    }

    if (req.method !== "POST" || req.url !== "/v1/jobs") {
      return sendJson(res, 404, { success: false, message: "Not found." });
    }

    if (!authorized(req)) return sendJson(res, 401, { success: false, message: "Unauthorized." });
    if (shuttingDown || !isAcceptingJobs()) {
      return sendJson(res, 503, { success: false, message: "Judge worker is shutting down. Please retry shortly." });
    }
    if (!dockerReady) {
      await refreshDockerReadiness();
      if (!dockerReady) return sendJson(res, 503, { success: false, message: "Judge runtime is temporarily unavailable." });
    }

    const job = await readJson(req);
    if (!isValidJob(job)) return sendJson(res, 400, { success: false, message: "Invalid judge job." });

    const jobId = randomUUID();
    const accepted = await enqueueJob({ ...job, jobId });
    if (!accepted) {
      return sendJson(res, 429, {
        success: false,
        message: "Judge queue is temporarily full. Please retry shortly.",
        status: "Queue Full",
      });
    }

    return sendJson(res, 202, { success: true, jobId, status: "Pending" });
  } catch (error) {
    log("error", "request_failed", { message: error.message, statusCode: error.statusCode || 500 });
    return sendJson(res, error.statusCode || 500, { success: false, message: error.message || "Internal judge error." });
  }
});

const shutdown = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  stopAcceptingJobs();
  log("log", "shutdown_started", { signal, graceMs: SHUTDOWN_GRACE_MS });

  server.close(async () => {
    const drained = await waitForIdle(SHUTDOWN_GRACE_MS);
    log(drained ? "log" : "error", drained ? "shutdown_drained" : "shutdown_timeout", getQueueStats());
    process.exit(drained ? 0 : 1);
  });

  setTimeout(() => {
    log("error", "shutdown_forced", getQueueStats());
    process.exit(1);
  }, SHUTDOWN_GRACE_MS + 2000).unref();
};

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

server.listen(PORT, "0.0.0.0", async () => {
  log("log", "server_started", { port: PORT });
  await refreshDockerReadiness();
  log(dockerReady ? "log" : "error", dockerReady ? "docker_ready" : "server_not_ready", { port: PORT });
});