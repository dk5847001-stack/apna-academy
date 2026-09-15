import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";

const SECRET = "runtime-integration-test-secret";
const SUBMISSION_ID = "507f1f77bcf86cd799439011";
const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error(`Timed out after ${ms}ms.`)), ms));

const listen = (server) => new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server.address().port)));
const request = async (url, options = {}) => {
  const response = await fetch(url, options);
  const body = await response.json();
  return { status: response.status, body };
};

const waitFor = async (fn, ms = 120000) => {
  const started = Date.now();
  while (Date.now() - started < ms) {
    try { return await fn(); } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Condition was not reached before timeout.");
};

let callbackReceived = false;
let callbackPayload = null;
let callbackPath = null;
let callbackAuthorized = false;

const mockBackend = createServer(async (req, res) => {
  if (req.method !== "POST") { res.writeHead(404).end(); return; }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);

  try {
    callbackPath = req.url;
    callbackAuthorized = req.headers["x-judge-secret"] === SECRET;
    callbackPayload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    callbackReceived = true;
    res.writeHead(callbackAuthorized ? 200 : 401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: callbackAuthorized }));
  } catch {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false }));
  }
});

const run = async () => {
  const backendPort = await listen(mockBackend);
  const workerPort = 6200 + Math.floor(Math.random() * 500);
  const child = spawn(process.execPath, ["src/server.js"], {
    cwd: new URL("..", import.meta.url).pathname,
    env: {
      ...process.env,
      PORT: String(workerPort),
      JUDGE_SERVICE_SECRET: SECRET,
      BACKEND_PUBLIC_URL: `http://127.0.0.1:${backendPort}`,
      JUDGE_SHUTDOWN_GRACE_MS: "10000",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const logs = [];
  let childExited = false;
  const childExitPromise = new Promise((resolve) => child.once("exit", (code, signal) => {
    childExited = true;
    resolve({ code, signal });
  }));
  child.stdout.on("data", (chunk) => logs.push(chunk.toString()));
  child.stderr.on("data", (chunk) => logs.push(chunk.toString()));

  try {
    await waitFor(async () => {
      const result = await request(`http://127.0.0.1:${workerPort}/ready`);
      assert.equal(result.status, 200, JSON.stringify(result.body));
      return result;
    }, 60000);

    const job = {
      submissionId: SUBMISSION_ID,
      problem: { slug: "two-sum", language: "JavaScript", timeLimitMs: 5000, memoryLimitMb: 128 },
      code: "class Solution { twoSum(nums, target) { return [0, 1]; } }",
      testCases: [{ input: JSON.stringify({ args: [[2, 7, 11, 15], 9] }), expectedOutput: JSON.stringify([0, 1]) }],
    };

    const accepted = await request(`http://127.0.0.1:${workerPort}/v1/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Judge-Secret": SECRET },
      body: JSON.stringify(job),
    });
    assert.equal(accepted.status, 202, JSON.stringify(accepted.body));
    assert.equal(accepted.body.status, "Pending");
    assert.ok(accepted.body.jobId);

    await waitFor(() => {
      assert.equal(callbackReceived, true, "Judge worker did not callback the backend.");
      assert.equal(callbackAuthorized, true, "Judge callback did not carry the configured secret.");
      assert.equal(callbackPath, `/api/v1/dsa/submissions/${SUBMISSION_ID}/judge-result`);
      assert.equal(callbackPayload?.status, "Accepted");
      assert.equal(callbackPayload?.passedTests, 1);
      assert.equal(callbackPayload?.totalTests, 1);
      assert.equal(typeof callbackPayload?.executionTimeMs, "number");
      return callbackPayload;
    }, 60000);

    assert.match(logs.join(""), /server_started/);
    assert.match(logs.join(""), /docker_ready/);

    child.kill("SIGTERM");
    const exit = await Promise.race([childExitPromise, timeout(15000)]);
    assert.equal(exit.code, 0, logs.join(""));
  } finally {
    if (!childExited) child.kill("SIGKILL");
    await new Promise((resolve) => mockBackend.close(resolve));
  }
};

await run();
console.log(`Runtime integration smoke test ${randomUUID()} completed.`);
