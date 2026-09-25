import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const failures = [];
let passed = 0;
let total = 0;

const read = (file) => {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) {
    failures.push("Missing required file: " + file);
    return "";
  }
  return fs.readFileSync(p, "utf8");
};

const assert = (condition, message) => {
  total += 1;
  if (condition) passed += 1;
  else failures.push(message);
};

const requiredFiles = [
  "Backend/src/config/ai.js","Backend/src/config/env.js","Backend/src/services/ai.service.js",
  "Backend/src/services/nvidia.service.js","Backend/src/services/nvidia.embedding.service.js",
  "Backend/src/services/ai.rag.service.js","Backend/src/services/aiCourseAuthorization.service.js",
  "Backend/src/services/aiConversation.service.js","Backend/src/services/aiLearning.service.js",
  "Backend/src/services/aiUsage.service.js","Backend/src/middleware/aiAuth.middleware.js",
  "Backend/src/middleware/aiGuestRateLimit.middleware.js","Backend/src/middleware/aiAuthenticatedRateLimit.middleware.js",
  "Backend/src/middleware/aiConcurrency.middleware.js","Backend/src/routes/ai.routes.js",
  "Backend/src/routes/aiConversation.routes.js","Backend/src/routes/aiCourse.routes.js",
  "Backend/src/routes/aiLearning.routes.js","Backend/src/routes/aiUsage.routes.js",
  "Backend/src/routes/admin.ai.routes.js","Backend/src/routes/admin.aiUsage.routes.js",
  "Backend/src/models/AIConversation.js","Backend/src/models/AIMessage.js",
  "Backend/src/models/AIKnowledgeChunk.js","Backend/src/models/AIUsageEvent.js",
  "Frontend/src/components/AIAssistant.jsx","Course/src/components/CourseAIAssistant.jsx",
  "Course/src/components/CourseAILearningTools.jsx","Admin/src/components/AIUsagePanel.jsx"
];
for (const file of requiredFiles) read(file);

const env = read("Backend/src/config/env.js");
const ai = read("Backend/src/config/ai.js");
const service = read("Backend/src/services/ai.service.js");
const nvidia = read("Backend/src/services/nvidia.service.js");
const rag = read("Backend/src/services/ai.rag.service.js");
const auth = read("Backend/src/middleware/aiAuth.middleware.js");
const guest = read("Backend/src/middleware/aiGuestRateLimit.middleware.js");
const userLimit = read("Backend/src/middleware/aiAuthenticatedRateLimit.middleware.js");
const concurrency = read("Backend/src/middleware/aiConcurrency.middleware.js");
const routes = read("Backend/src/routes/index.js");
const conversation = read("Backend/src/services/aiConversation.service.js");
const authorization = read("Backend/src/services/aiCourseAuthorization.service.js");
const learningRoutes = read("Backend/src/routes/aiLearning.routes.js");
const learningService = read("Backend/src/services/aiLearning.service.js");
const usage = read("Backend/src/services/aiUsage.service.js");
const usageModel = read("Backend/src/models/AIUsageEvent.js");

assert(/NVIDIA_NIM_API_KEY/.test(env), "AI env validation must require the NVIDIA key when AI is enabled.");
assert(/url\.protocol !== "https:"/.test(env), "AI provider URLs must require HTTPS.");
assert(/AI_RAG_ENABLED/.test(env), "RAG env validation must exist.");
assert(/NVIDIA_NIM_API_KEY/.test(ai), "AI config must source the provider key from environment.");
assert(/generateChatCompletion/.test(service) && /recordAIUsage/.test(service), "AI service must call provider and telemetry services.");
assert(/Authorization/.test(nvidia) && /NVIDIA_NIM_API_KEY/.test(nvidia), "Provider auth must stay server-side.");
assert(/hostAllowed/.test(rag) && /%PDF-/.test(rag), "RAG ingestion must validate hosts and PDF magic header.");
assert(/module: \{ \$in: \[null, \.\.\.allowedModuleIds\] \}/.test(rag), "RAG retrieval must enforce unlocked-module scope.");
assert(/isEmailVerified/.test(auth) && /status/.test(auth), "Authenticated AI must require an active verified user.");
assert(/dailyMax/.test(guest) && /Retry-After/.test(guest), "Guest AI must enforce daily and burst limits.");
assert(/peek\(/.test(userLimit) && /consume\(/.test(userLimit), "Authenticated rate limiting must check before consuming.");
assert(/maxConcurrent/.test(concurrency), "AI concurrency protection must exist.");
assert(/router\.use\("\/ai"/.test(routes) && /router\.use\("\/admin\/ai"/.test(routes), "AI and admin AI routes must be registered.");
assert(/requireCourseAIEntitlement/.test(conversation), "Conversation operations must re-check course entitlement.");
assert(/requireCourseAIEntitlement/.test(authorization), "Course AI authorization must be centralized.");
assert(/maxRequests: AI_CONFIG.authWindowRequests/.test(learningRoutes) && /dailyMaxRequests: AI_CONFIG.authDailyRequests/.test(learningRoutes), "Learning routes must map AI config limits to the rate-limiter contract.");
assert(/String\(question \|\| \"\"\)\.trim\(\)/.test(learningService), "Code review must normalize non-string question input safely.");
assert(/aggregate/.test(usage), "AI usage analytics must aggregate persisted events.");
assert(!/prompt|responseText|rawIp|apiKey/i.test(usageModel), "Usage events must not persist prompt/response/API key/raw IP fields.");

const secretPatterns = [
  /nvapi-[A-Za-z0-9_-]{20,}/,
  /NVIDIA_NIM_API_KEY\s*=\s*[^\s$][^\n]*/,
  /RAZORPAY_KEY_SECRET\s*=\s*[^\s$][^\n]*/
];
for (const directory of ["Backend/src","Frontend/src","Course/src","Admin/src","docs"]) {
  const start = path.join(root, directory);
  if (!fs.existsSync(start)) continue;
  const stack = [start];
  while (stack.length) {
    const current = stack.pop();
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(current)) stack.push(path.join(current, entry));
      continue;
    }
    if (!/\.(js|jsx|mjs|md|json|env|example)$/.test(current)) continue;
    const text = fs.readFileSync(current, "utf8");
    for (const pattern of secretPatterns) {
      assert(!pattern.test(text), "Potential secret-like value found in " + path.relative(root, current) + ".");
    }
  }
}

const syntaxTargets = requiredFiles.filter((file) => file.startsWith("Backend/") && file.endsWith(".js"));
for (const file of syntaxTargets) {
  const result = spawnSync(process.execPath, ["--check", path.join(root, file)], { encoding: "utf8" });
  assert(result.status === 0, "Node syntax check failed: " + file + (result.stderr ? " - " + result.stderr.trim() : ""));
}

console.log("AI Phase 10 QA: " + passed + "/" + total + " checks passed.");
if (failures.length) {
  console.error("\nFailures:");
  for (const failure of failures) console.error("- " + failure);
  process.exit(1);
}
console.log("Static security and architecture checks passed. No NVIDIA/provider request was made.");
