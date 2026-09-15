import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const execFileAsync = promisify(execFile);
const MAX_TEST_CASES = 1000;
const MAX_CODE_LENGTH = 50000;
const MAX_INPUT_LENGTH = 50000;
const MAX_OUTPUT_LENGTH = 100000;
const ALLOWED_LANGUAGES = new Set(["Java", "C++", "Python", "JavaScript"]);
const IMAGE_BY_LANGUAGE = {
  Java: process.env.JUDGE_JAVA_IMAGE || "eclipse-temurin:21-jdk",
  "C++": process.env.JUDGE_CPP_IMAGE || "gcc:14",
  Python: process.env.JUDGE_PYTHON_IMAGE || "python:3.12-slim",
  JavaScript: process.env.JUDGE_NODE_IMAGE || "node:22-bookworm-slim",
};

const queue = [];
let running = false;

const ADAPTERS = {
  "two-sum": { method: "twoSum", returnType: "int[]" },
  "valid-parentheses": { method: "isValid", returnType: "boolean" },
  "best-time-to-buy-and-sell-stock": { method: "maxProfit", returnType: "int" },
  "binary-search": { method: "search", returnType: "int" },
  "contains-duplicate": { method: "containsDuplicate", returnType: "boolean" },
  "product-of-array-except-self": { method: "productExceptSelf", returnType: "int[]" },
  "maximum-subarray": { method: "maxSubArray", returnType: "int" },
  "merge-intervals": { method: "merge", returnType: "int[][]" },
  "longest-substring-without-repeating-characters": { method: "lengthOfLongestSubstring", returnType: "int" },
  "3sum": { method: "threeSum", returnType: "int[][]" },
  "group-anagrams": { method: "groupAnagrams", returnType: "List<List<String>>" },
  "top-k-frequent-elements": { method: "topKFrequent", returnType: "int[]" },
  "number-of-islands": { method: "numIslands", returnType: "int" },
  "course-schedule": { method: "canFinish", returnType: "boolean" },
  "binary-tree-level-order-traversal": { method: "levelOrder", returnType: "List<List<Integer>>" },
  "lowest-common-ancestor-binary-tree": { method: "lowestCommonAncestor", returnType: "TreeNode" },
  "coin-change": { method: "coinChange", returnType: "int" },
  "longest-increasing-subsequence": { method: "lengthOfLIS", returnType: "int" },
  "trapping-rain-water": { method: "trap", returnType: "int" },
  "median-of-two-sorted-arrays": { method: "findMedianSortedArrays", returnType: "double" },
};

export const isValidJob = (job) => {
  if (!job || typeof job !== "object") return false;
  if (!/^[a-f0-9]{24}$/i.test(String(job.submissionId || ""))) return false;
  if (!job.problem || typeof job.problem !== "object") return false;
  if (!ALLOWED_LANGUAGES.has(job.problem.language)) return false;
  if (typeof job.problem.slug !== "string" || !ADAPTERS[job.problem.slug]) return false;
  if (typeof job.code !== "string" || !job.code.trim() || job.code.length > MAX_CODE_LENGTH) return false;
  if (!Array.isArray(job.testCases) || job.testCases.length === 0 || job.testCases.length > MAX_TEST_CASES) return false;
  return job.testCases.every((test) => typeof test?.input === "string" && test.input.length <= MAX_INPUT_LENGTH && typeof test?.expectedOutput === "string" && test.expectedOutput.length <= MAX_OUTPUT_LENGTH);
};

export const enqueueJob = async (job) => {
  queue.push(job);
  void processQueue();
};

const processQueue = async () => {
  if (running) return;
  running = true;
  while (queue.length) {
    const job = queue.shift();
    try { await executeJob(job); }
    catch (error) {
      console.error(`Judge job ${job.jobId} failed:`, error.message);
      try { await sendResult(job, { status: "Internal Error", passedTests: 0, totalTests: job.testCases.length, executionTimeMs: null, memoryUsedMb: null, judgeMessage: "Judge worker failed while executing the submission." }); }
      catch (callbackError) { console.error(`Judge callback ${job.jobId} failed:`, callbackError.message); }
    }
  }
  running = false;
};

const bounded = (value, min, max, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, Math.floor(number))) : fallback;
};

const dockerArgs = ({ image, workDir, command, memoryMb }) => [
  "run", "--rm", "--network=none", "--read-only", "--cap-drop=ALL",
  "--security-opt=no-new-privileges", "--pids-limit=64", `--memory=${memoryMb}m`,
  "--memory-swap", `${memoryMb}m`, "--cpus=1", "--tmpfs", "/tmp:rw,nosuid,nodev,noexec,size=64m",
  "--mount", `type=bind,src=${workDir},dst=/workspace,readonly", "--workdir", "/workspace", image, ...command,
];

const buildHarness = (job, inputPath) => {
  const config = ADAPTERS[job.problem.slug];
  if (!config) throw new Error("Unsupported problem adapter.");
  const encodedInputPath = inputPath.replaceAll("\\", "/");
  if (job.problem.language === "Python") return `import json\nimport sys\n\n${job.code}\n\nwith open(${JSON.stringify(encodedInputPath)}, "r", encoding="utf-8") as f:\ndata = json.load(f)\nresult = Solution().${config.method}(*data["args"])\nprint(json.dumps(result, separators=(",", ":"), default=lambda o: o.__dict__))\n`;
  if (job.problem.language === "JavaScript") return `${job.code}\nconst fs = require("fs");\nconst data = JSON.parse(fs.readFileSync(${JSON.stringify(encodedInputPath)}, "utf8"));\nconst result = new Solution().${config.method}(...data.args);\nprocess.stdout.write(JSON.stringify(result));\n`;
  if (job.problem.language === "Java") return `import java.io.*;\nimport java.util.*;\n${job.code}\npublic class Main {\n  static Object[] parseArgs(String s) { throw new RuntimeException("Java adapter requires structured test harness configuration."); }\n  public static void main(String[] args) throws Exception { throw new RuntimeException("Java adapter harness pending typed serializer generation."); }\n}\n`;
  return `#include <bits/stdc++.h>\nusing namespace std;\n${job.code}\nint main(){ throw runtime_error("C++ adapter harness pending typed serializer generation."); }\n`;
};

const sourceFile = (language) => ({ Java: "Main.java", "C++": "Main.cpp", Python: "main.py", JavaScript: "main.js" })[language];

const runContainer = async ({ job, workDir, input }) => {
  const memoryMb = bounded(job.problem.memoryLimitMb, 16, 2048, 256);
  const timeLimitMs = bounded(job.problem.timeLimitMs, 100, 30000, 2000);
  const image = IMAGE_BY_LANGUAGE[job.problem.language];
  const started = Date.now();
  await writeFile(join(workDir, "input.json"), input, "utf8");
  const harness = buildHarness(job, "/workspace/input.json");
  await writeFile(join(workDir, sourceFile(job.problem.language)), harness, "utf8");
  const command = job.problem.language === "Java" ? ["sh", "-c", "javac Main.java && java Main"] : job.problem.language === "C++" ? ["sh", "-c", "g++ -std=c++20 -O2 -pipe -o main Main.cpp && ./main"] : job.problem.language === "Python" ? ["python", "main.py"] : ["node", "main.js"];
  const args = dockerArgs({ image, workDir, command, memoryMb });
  try {
    const result = await execFileAsync("docker", args, { timeout: timeLimitMs + 1000, maxBuffer: 1024 * 1024 });
    return { stdout: result.stdout, stderr: result.stderr, executionTimeMs: Date.now() - started, timedOut: false };
  } catch (error) {
    return { stdout: error.stdout || "", stderr: error.stderr || error.message || "", executionTimeMs: Date.now() - started, timedOut: error.killed || error.code === "ETIMEDOUT" };
  }
};

const normalize = (value) => String(value ?? "").replace(/\r\n/g, "\n").trim();

const executeJob = async (job) => {
  const workDir = await mkdtemp(join(tmpdir(), "apna-dsa-"));
  try {
    let passed = 0; let status = "Accepted"; let judgeMessage = "All tests passed."; let maxTime = 0;
    for (const testCase of job.testCases) {
      const result = await runContainer({ job, workDir, input: testCase.input });
      maxTime = Math.max(maxTime, result.executionTimeMs);
      if (result.timedOut) { status = "TLE"; judgeMessage = "Execution time limit exceeded."; break; }
      if (result.stderr) { status = /compil|syntax/i.test(result.stderr) ? "Compilation Error" : "Runtime Error"; judgeMessage = result.stderr.slice(0, 5000); break; }
      if (normalize(result.stdout) !== normalize(testCase.expectedOutput)) { status = "Wrong Answer"; judgeMessage = "Output does not match the expected result."; break; }
      passed += 1;
    }
    await sendResult(job, { status, passedTests: passed, totalTests: job.testCases.length, executionTimeMs: maxTime, memoryUsedMb: null, judgeMessage });
  } finally { await rm(workDir, { recursive: true, force: true }); }
};

const sendResult = async (job, result) => {
  const backendUrl = process.env.BACKEND_PUBLIC_URL?.trim();
  const secret = process.env.JUDGE_SERVICE_SECRET?.trim();
  if (!backendUrl || !secret) throw new Error("BACKEND_PUBLIC_URL and JUDGE_SERVICE_SECRET are required.");
  const response = await fetch(`${backendUrl.replace(/\/$/, "")}/api/v1/dsa/submissions/${job.submissionId}/judge-result`, { method: "POST", headers: { "Content-Type": "application/json", "X-Judge-Secret": secret }, body: JSON.stringify(result), signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`Backend callback failed with status ${response.status}.`);
};
