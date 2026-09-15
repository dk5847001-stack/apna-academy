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
const MAX_QUEUE_SIZE = (() => {
  const value = Number(process.env.JUDGE_MAX_QUEUE || 100);
  return Number.isFinite(value) ? Math.min(1000, Math.max(1, Math.floor(value))) : 100;
})();
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
  "two-sum": { method: "twoSum", args: ["int[]"], returnType: "int[]" },
  "valid-parentheses": { method: "isValid", args: ["string"], returnType: "boolean" },
  "best-time-to-buy-and-sell-stock": { method: "maxProfit", args: ["int[]"], returnType: "int" },
  "binary-search": { method: "search", args: ["int[]", "int"], returnType: "int" },
  "contains-duplicate": { method: "containsDuplicate", args: ["int[]"], returnType: "boolean" },
  "product-of-array-except-self": { method: "productExceptSelf", args: ["int[]"], returnType: "int[]" },
  "maximum-subarray": { method: "maxSubArray", args: ["int[]"], returnType: "int" },
  "merge-intervals": { method: "merge", args: ["int[][]"], returnType: "int[][]" },
  "longest-substring-without-repeating-characters": { method: "lengthOfLongestSubstring", args: ["string"], returnType: "int" },
  "3sum": { method: "threeSum", args: ["int[]"], returnType: "int[][]", normalize: "nestedInt" },
  "group-anagrams": { method: "groupAnagrams", args: ["string[]"], returnType: "string[][]", normalize: "nestedString" },
  "top-k-frequent-elements": { method: "topKFrequent", args: ["int[]", "int"], returnType: "int[]", normalize: "intSet" },
  "number-of-islands": { method: "numIslands", args: ["char[][]"], returnType: "int" },
  "course-schedule": { method: "canFinish", args: ["int", "int[][]"], returnType: "boolean" },
  "binary-tree-level-order-traversal": { method: "levelOrder", args: ["tree"], returnType: "int[][]" },
  "lowest-common-ancestor-binary-tree": { method: "lowestCommonAncestor", args: ["tree", "treeNode", "treeNode"], returnType: "treeNode" },
  "coin-change": { method: "coinChange", args: ["int[]", "int"], returnType: "int" },
  "longest-increasing-subsequence": { method: "lengthOfLIS", args: ["int[]"], returnType: "int" },
  "trapping-rain-water": { method: "trap", args: ["int[]"], returnType: "int" },
  "median-of-two-sorted-arrays": { method: "findMedianSortedArrays", args: ["int[]", "int[]"], returnType: "double" },
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

export const getQueueStats = () => ({ queued: queue.length, running, maxQueueSize: MAX_QUEUE_SIZE });

export const enqueueJob = async (job) => {
  if (queue.length >= MAX_QUEUE_SIZE) return false;
  queue.push(job);
  void processQueue();
  return true;
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
  "--mount", `type=bind,src=${workDir},dst=/workspace`, "--workdir", "/workspace", image, ...command,
];

const parseInput = (testInput) => {
  let data;
  try { data = JSON.parse(testInput); } catch { throw new Error("Test case input is not valid JSON."); }
  if (!data || !Array.isArray(data.args)) throw new Error("Test case input must contain an args array.");
  return data.args;
};

const quotePy = (value) => JSON.stringify(value).replace(/\\u2028/g, "\\u2028").replace(/\\u2029/g, "\\u2029");
const quoteJs = (value) => JSON.stringify(value);
const quoteJava = (value) => JSON.stringify(String(value));

const javaLiteral = (type, value) => {
  if (type === "int") return String(Number(value));
  if (type === "string") return quoteJava(value);
  if (type === "int[]") return `new int[]{${value.map((v) => Number(v)).join(",")}}`;
  if (type === "string[]") return `new String[]{${value.map(quoteJava).join(",")}}`;
  if (type === "int[][]") return `new int[][]{${value.map((row) => `{${row.map((v) => Number(v)).join(",")}}`).join(",")}}`;
  if (type === "char[][]") return `new char[][]{${value.map((row) => `{${[...(typeof row === "string" ? row : row)].map((v) => `${quoteJava(v)}.charAt(0)`).join(",")}}`).join(",")}}`;
  if (type === "tree") return "buildTree(new Integer[]{" + value.map((v) => v === null ? "null" : Number(v)).join(",") + "})";
  if (type === "treeNode") return `findNode(root, ${Number(value)})`;
  throw new Error(`Unsupported Java argument type: ${type}`);
};

const cppString = (value) => JSON.stringify(String(value));
const cppLiteral = (type, value) => {
  if (type === "int") return String(Number(value));
  if (type === "string") return cppString(value);
  if (type === "int[]") return `vector<int>{${value.map((v) => Number(v)).join(",")}}`;
  if (type === "string[]") return `vector<string>{${value.map(cppString).join(",")}}`;
  if (type === "int[][]") return `vector<vector<int>>{${value.map((row) => `vector<int>{${row.map((v) => Number(v)).join(",")}}`).join(",")}}`;
  if (type === "char[][]") return `vector<vector<char>>{${value.map((row) => `vector<char>{${[...(typeof row === "string" ? row : row)].map((v) => `'${String(v).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`).join(",")}}`).join(",")}}`;
  if (type === "tree") return "buildTree(vector<optional<int>>{" + value.map((v) => v === null ? "nullopt" : `optional<int>(${Number(v)})`).join(",") + "})";
  if (type === "treeNode") return `findNode(root, ${Number(value)})`;
  throw new Error(`Unsupported C++ argument type: ${type}`);
};

const pyLiteral = (type, value) => {
  if (type === "tree") return "build_tree(" + quotePy(value) + ")";
  if (type === "treeNode") return `find_node(root, ${Number(value)})`;
  return quotePy(value);
};

const jsLiteral = (type, value) => {
  if (type === "tree") return "buildTree(" + quoteJs(value) + ")";
  if (type === "treeNode") return `findNode(root, ${Number(value)})`;
  return quoteJs(value);
};

const javaTreeHelpers = `
static class TreeNode { int val; TreeNode left,right; TreeNode(int v){val=v;} }
static TreeNode buildTree(Integer[] a){ if(a.length==0||a[0]==null)return null; TreeNode r=new TreeNode(a[0]); java.util.Queue<TreeNode> q=new java.util.ArrayDeque<>(); q.add(r); int i=1; while(!q.isEmpty()&&i<a.length){TreeNode n=q.poll(); if(i<a.length&&a[i]!=null){n.left=new TreeNode(a[i]);q.add(n.left);}i++; if(i<a.length&&a[i]!=null){n.right=new TreeNode(a[i]);q.add(n.right);}i++;} return r; }
static TreeNode findNode(TreeNode r,int v){ if(r==null)return null; if(r.val==v)return r; TreeNode x=findNode(r.left,v); return x!=null?x:findNode(r.right,v); }
`;

const cppTreeHelpers = `
struct TreeNode { int val; TreeNode* left; TreeNode* right; TreeNode(int v):val(v),left(nullptr),right(nullptr){} };
TreeNode* buildTree(const vector<optional<int>>& a){ if(a.empty()||!a[0].has_value())return nullptr; TreeNode* r=new TreeNode(*a[0]); queue<TreeNode*> q; q.push(r); size_t i=1; while(!q.empty()&&i<a.size()){auto n=q.front();q.pop(); if(i<a.size()&&a[i]){n->left=new TreeNode(*a[i]);q.push(n->left);}i++; if(i<a.size()&&a[i]){n->right=new TreeNode(*a[i]);q.push(n->right);}i++;} return r; }
TreeNode* findNode(TreeNode* r,int v){ if(!r)return nullptr; if(r->val==v)return r; TreeNode* x=findNode(r->left,v); return x?x:findNode(r->right,v); }
`;

const pythonTreeHelpers = `
class TreeNode:
    def __init__(self, val=0, left=None, right=None): self.val, self.left, self.right = val, left, right

def build_tree(values):
    if not values or values[0] is None: return None
    root=TreeNode(values[0]); q=[root]; i=1
    while q and i < len(values):
        node=q.pop(0)
        if i < len(values) and values[i] is not None: node.left=TreeNode(values[i]); q.append(node.left)
        i+=1
        if i < len(values) and values[i] is not None: node.right=TreeNode(values[i]); q.append(node.right)
        i+=1
    return root

def find_node(root, value):
    if root is None: return None
    if root.val == value: return root
    x=find_node(root.left, value)
    return x if x is not None else find_node(root.right, value)
`;

const jsTreeHelpers = `
class TreeNode { constructor(val=0,left=null,right=null){this.val=val;this.left=left;this.right=right;} }
function buildTree(values){if(!values.length||values[0]===null)return null;const r=new TreeNode(values[0]),q=[r];let i=1;while(q.length&&i<values.length){const n=q.shift();if(i<values.length&&values[i]!==null){n.left=new TreeNode(values[i]);q.push(n.left);}i++;if(i<values.length&&values[i]!==null){n.right=new TreeNode(values[i]);q.push(n.right);}i++;}return r;}
function findNode(root,value){if(!root)return null;if(root.val===value)return root;return findNode(root.left,value)||findNode(root.right,value);}
`;

const buildHarness = (job, testInput) => {
  const config = ADAPTERS[job.problem.slug];
  const args = parseInput(testInput);
  if (args.length !== config.args.length) throw new Error(`Expected ${config.args.length} arguments, received ${args.length}.`);
  const language = job.problem.language;
  if (language === "Python") {
    const calls = config.args.map((type, i) => pyLiteral(type, args[i])).join(", ");
    return `${job.code}\n${pythonTreeHelpers}\nresult = Solution().${config.method}(${calls})\n` + `import json\nprint(json.dumps(result.val if hasattr(result, "val") else result, separators=(",", ":"), sort_keys=True))\n`;
  }
  if (language === "JavaScript") {
    const calls = config.args.map((type, i) => jsLiteral(type, args[i])).join(", ");
    return `${jsTreeHelpers}\n${job.code}\nconst root = ${config.args.includes("tree") ? jsLiteral("tree", args[config.args.indexOf("tree")]) : "null"};\nconst result = new Solution().${config.method}(${calls});\nprocess.stdout.write(JSON.stringify(result && result.val !== undefined ? result.val : result));\n`;
  }
  if (language === "Java") {
    const calls = config.args.map((type, i) => javaLiteral(type, args[i])).join(", ");
    const rootIndex = config.args.indexOf("tree");
    const rootDecl = rootIndex >= 0 ? `TreeNode root=${javaLiteral("tree", args[rootIndex])};` : "TreeNode root=null;";
    return `import java.util.*;\n${job.code}\npublic class Main {\n${javaTreeHelpers}\nstatic String json(Object x){ if(x==null)return "null"; if(x instanceof String)return "\\\""+((String)x).replace("\\\\","\\\\\\\\").replace("\\\"","\\\\\\\"")+"\\\""; if(x instanceof Character)return json(String.valueOf(x)); if(x instanceof Boolean)return x.toString(); if(x instanceof Number)return x.toString(); if(x instanceof int[])return Arrays.toString((int[])x).replace(" ",""); if(x instanceof int[][]){int[][] a=(int[][])x;StringBuilder s=new StringBuilder("[");for(int i=0;i<a.length;i++){if(i>0)s.append(',');s.append(json(a[i]));}return s.append(']').toString();} if(x instanceof List){List<?> a=(List<?>)x;StringBuilder s=new StringBuilder("[");for(int i=0;i<a.size();i++){if(i>0)s.append(',');s.append(json(a.get(i)));}return s.append(']').toString();} if(x instanceof TreeNode)return String.valueOf(((TreeNode)x).val); return json(String.valueOf(x)); }\npublic static void main(String[] z){${rootDecl} Solution s=new Solution(); Object result=s.${config.method}(${calls}); System.out.print(json(result));}\n}\n`;
  }
  const calls = config.args.map((type, i) => cppLiteral(type, args[i])).join(", ");
  const rootIndex = config.args.indexOf("tree");
  const rootDecl = rootIndex >= 0 ? `TreeNode* root=${cppLiteral("tree", args[rootIndex])};` : "TreeNode* root=nullptr;";
  return `#include <bits/stdc++.h>\nusing namespace std;\n${cppTreeHelpers}\n${job.code}\nstring outIntVec(const vector<int>& a){ostringstream s;s<<"[";for(size_t i=0;i<a.size();i++){if(i)s<<",";s<<a[i];}return s.str()+"]";}\ntemplate<class T> string out(const T& x){ostringstream s;s<<x;return s.str();}\nstring out(const vector<int>& a){return outIntVec(a);}\nstring out(const vector<vector<int>>& a){string s="[";for(size_t i=0;i<a.size();i++){if(i)s+=",";s+=outIntVec(a[i]);}return s+"]";}\nstring out(const string& x){string s="\\\"";for(char c:x){if(c=='\\\\'||c=='\\\"')s+='\\\\';s+=c;}return s+"\\\"";}\nstring out(const vector<string>& a){string s="[";for(size_t i=0;i<a.size();i++){if(i)s+=",";s+=out(a[i]);}return s+"]";}\nstring out(const vector<vector<string>>& a){string s="[";for(size_t i=0;i<a.size();i++){if(i)s+=",";s+=out(a[i]);}return s+"]";}\nstring out(bool x){return x?"true":"false";}\nstring out(TreeNode* x){return x?to_string(x->val):"null";}\nint main(){${rootDecl} Solution s; auto result=s.${config.method}(${calls}); cout<<out(result);}\n`;
};

const sourceFile = (language) => ({ Java: "Main.java", "C++": "Main.cpp", Python: "main.py", JavaScript: "main.js" })[language];

const runContainer = async ({ job, workDir, testInput }) => {
  const memoryMb = bounded(job.problem.memoryLimitMb, 16, 2048, 256);
  const timeLimitMs = bounded(job.problem.timeLimitMs, 100, 30000, 2000);
  const image = IMAGE_BY_LANGUAGE[job.problem.language];
  const started = Date.now();
  const harness = buildHarness(job, testInput);
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

const normalize = (value, mode) => {
  const raw = String(value ?? "").replace(/\r\n/g, "\n").trim();
  if (!mode) return raw;
  try {
    const parsed = JSON.parse(raw);
    if (mode === "intSet") return JSON.stringify([...parsed].map(Number).sort((a,b)=>a-b));
    if (mode === "nestedInt") return JSON.stringify(parsed.map((row)=>row.map(Number).sort((a,b)=>a-b)).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))));
    if (mode === "nestedString") return JSON.stringify(parsed.map((row)=>[...row].map(String).sort()).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))));
  } catch { return raw; }
  return raw;
};

const executeJob = async (job) => {
  const config = ADAPTERS[job.problem.slug];
  const workDir = await mkdtemp(join(tmpdir(), "apna-dsa-"));
  try {
    let passed = 0; let status = "Accepted"; let judgeMessage = "All tests passed."; let maxTime = 0;
    for (const testCase of job.testCases) {
      const result = await runContainer({ job, workDir, testInput: testCase.input });
      maxTime = Math.max(maxTime, result.executionTimeMs);
      if (result.timedOut) { status = "TLE"; judgeMessage = "Execution time limit exceeded."; break; }
      if (result.stderr) { status = /compil|syntax/i.test(result.stderr) ? "Compilation Error" : "Runtime Error"; judgeMessage = result.stderr.slice(0, 5000); break; }
      if (normalize(result.stdout, config.normalize) !== normalize(testCase.expectedOutput, config.normalize)) { status = "Wrong Answer"; judgeMessage = "Output does not match the expected result."; break; }
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
