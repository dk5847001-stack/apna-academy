import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const execFileAsync = promisify(execFile);
const MAX_TEST_CASES = 1000;
const MAX_CODE_LENGTH = 50000;
const ALLOWED_LANGUAGES = new Set(["Java", "C++", "Python", "JavaScript"]);
const IMAGE_BY_LANGUAGE = {
  Java: process.env.JUDGE_JAVA_IMAGE || "eclipse-temurin:21-jdk",
  "C++": process.env.JUDGE_CPP_IMAGE || "gcc:14",
  Python: process.env.JUDGE_PYTHON_IMAGE || "python:3.12-slim",
  JavaScript: process.env.JUDGE_NODE_IMAGE || "node:22-bookworm-slim",
};

const queue = [];
let running = false;

export const isValidJob = (job) => {
  if (!job || typeof job !== "object") return false;
  if (!/^[a-f0-9]{24}$/i.test(String(job.submissionId || ""))) return false;
  if (!job.problem || typeof job.problem !== "object") return false;
  if (!ALLOWED_LANGUAGES.has(job.problem.language)) return false;
  if (typeof job.code !== "string" || !job.code.trim() || job.code.length > MAX_CODE_LENGTH) return false;
  if (!Array.isArray(job.testCases) || job.testCases.length === 0 || job.testCases.length > MAX_TEST_CASES) return false;
  return job.testCases.every((test) => typeof test?.input === "string" && typeof test?.expectedOutput === "string");
};

export const enqueueJob = async (job) => {
  queue.push(job);
  processQueue();
};

const processQueue = async () => {
  if (running) return;
  running = true;
  while (queue.length) {
    const job = queue.shift();
    try { await executeJob(job); }
    catch (error) { console.error(`Job ${job.jobId} failed:`, error.message); }
  }
  running = false;
};

const bounded = (value, min, max, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, Math.floor(number))) : fallback;
};

const dockerArgs = ({ image, workDir, command, memoryMb, timeLimitMs }) => [
  "run", "--rm",
  "--network=none",
  "--read-only",
  "--cap-drop=ALL",
  "--security-opt=no-new-privileges",
  "--pids-limit=64",
  `--memory=${memoryMb}m`,
  "--memory-swap", `${memoryMb}m`,
  "--cpus=1",
  "--tmpfs", "/tmp:rw,nosuid,nodev,noexec,size=64m",
  "--mount", `type=bind,src=${workDir},dst=/workspace,readonly`,
  "--workdir", "/workspace",
  image,
  ...command,
  "__TIMEOUT_MS__", String(timeLimitMs),
];

const languageCommand = (language) => {
  if (language === "Java") return ["sh", "-c", "javac Main.java && java Main"];
  if (language === "C++") return ["sh", "-c", "g++ -std=c++20 -O2 -pipe -o main Main.cpp && ./main"];
  if (language === "Python") return ["python", "main.py"];
  return ["node", "main.js"];
};

const sourceFile = (language) => ({ Java: "Main.java", "C++": "Main.cpp", Python: "main.py", JavaScript: "main.js" })[language];

const runContainer = async ({ job, workDir, input }) => {
  const memoryMb = bounded(job.problem.memoryLimitMb, 16, 2048, 256);
  const timeLimitMs = bounded(job.problem.timeLimitMs, 100, 30000, 2000);
  const image = IMAGE_BY_LANGUAGE[job.problem.language];
  const command = languageCommand(job.problem.language);
  const args = dockerArgs({ image, workDir, command, memoryMb, timeLimitMs }).filter((item) => item !== "__TIMEOUT_MS__" && item !== String(timeLimitMs));
  const started = Date.now();
  try {
    const result = await execFileAsync("docker", args, { input, timeout: timeLimitMs + 1000, maxBuffer: 1024 * 1024 });
    return { stdout: result.stdout, stderr: result.stderr, executionTimeMs: Date.now() - started, timedOut: false };
  } catch (error) {
    return { stdout: error.stdout || "", stderr: error.stderr || error.message || "", executionTimeMs: Date.now() - started, timedOut: error.killed || error.code === "ETIMEDOUT" };
  }
};

const normalize = (value) => String(value ?? "").replace(/\r\n/g, "\n").trim();

const executeJob = async (job) => {
  const workDir = await mkdtemp(join(tmpdir(), "apna-dsa-"));
  try {
    await writeFile(join(workDir, sourceFile(job.problem.language)), job.code, "utf8");
    let passed = 0;
    let status = "Accepted";
    let judgeMessage = "All tests passed.";
    let maxTime = 0;

    for (const testCase of job.testCases) {
      const result = await runContainer({ job, workDir, input: testCase.input });
      maxTime = Math.max(maxTime, result.executionTimeMs);
      if (result.timedOut) { status = "TLE"; judgeMessage = "Execution time limit exceeded."; break; }
      if (result.stderr && /compil|syntax|error/i.test(result.stderr) && !result.stdout) { status = "Compilation Error"; judgeMessage = result.stderr.slice(0, 5000); break; }
      if (normalize(result.stdout) !== normalize(testCase.expectedOutput)) {
        status = "Wrong Answer";
        judgeMessage = "Output does not match the expected result.";
        break;
      }
      passed += 1;
    }

    await sendResult(job, { status, passedTests: passed, totalTests: job.testCases.length, executionTimeMs: maxTime, memoryUsedMb: null, judgeMessage });
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
};

const sendResult = async (job, result) => {
  const backendUrl = process.env.BACKEND_PUBLIC_URL?.trim();
  const secret = process.env.JUDGE_SERVICE_SECRET?.trim();
  if (!backendUrl || !secret) throw new Error("BACKEND_PUBLIC_URL and JUDGE_SERVICE_SECRET are required.");
  const response = await fetch(`${backendUrl.replace(/\/$/, "")}/api/v1/dsa/submissions/${job.submissionId}/judge-result`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Judge-Secret": secret },
    body: JSON.stringify(result),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Backend callback failed with status ${response.status}.`);
};
