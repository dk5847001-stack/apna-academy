import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";

const SECRET = "runtime-integration-test-secret";
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

const mockBackend = createServer(async (req, res) => {
  if (req.method !== "POST") { res.writeHead(404).end(); return; }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  res.writeHead(req.headers["x-judge-secret"] === SECRET ? 200 : 401, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: true, received: payload }));
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
  child.stdout.on("data", (chunk) => logs.push(chunk.toString()));
  child.stderr.on("data", (chunk) => logs.push(chunk.toString()));

  try {
    await waitFor(async () => {
      const result = await request(`http://127.0.0.1:${workerPort}/ready`);
      assert.equal(result.status, 200, JSON.stringify(result.body));
      return result;
    }, 60000);

    const job = {
      submissionId: "507f1f77bcf86cd799439011",
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

    await waitFor(() => {
      const callback = logs.join("");
      assert.match(callback, /server_started/);
      assert.match(callback, /docker_ready/);
      return true;
    }, 60000);

    child.kill("SIGTERM");
    const exitCode = await Promise.race([
      new Promise((resolve) => child.once("exit", (code) => resolve(code))),
      timeout(15000),
    ]);
    assert.equal(exitCode, 0, logs.join(""));
  } finally {
    if (!child.killed) child.kill("SIGKILL");
    await new Promise((resolve) => mockBackend.close(resolve));
  }
};

await run();
console.log(`Runtime integration smoke test ${randomUUID()} completed.`);
