import test from "node:test";
import assert from "node:assert/strict";
import { isValidJob } from "./worker.js";

const baseJob = {
  submissionId: "507f1f77bcf86cd799439011",
  problem: { slug: "two-sum", language: "JavaScript" },
  code: "class Solution { twoSum(nums, target) { return [0, 1]; } }",
  testCases: [
    { input: JSON.stringify({ args: [[2, 7, 11, 15], 9] }), expectedOutput: JSON.stringify([0, 1]) },
  ],
};

test("accepts a valid judge job", () => {
  assert.equal(isValidJob(baseJob), true);
});

test("rejects an invalid Mongo submission id", () => {
  assert.equal(isValidJob({ ...baseJob, submissionId: "not-an-object-id" }), false);
});

test("rejects unsupported languages", () => {
  assert.equal(isValidJob({ ...baseJob, problem: { ...baseJob.problem, language: "Ruby" } }), false);
});

test("rejects unsupported problem adapters", () => {
  assert.equal(isValidJob({ ...baseJob, problem: { ...baseJob.problem, slug: "unknown-problem" } }), false);
});

test("rejects empty or oversized source code", () => {
  assert.equal(isValidJob({ ...baseJob, code: "   " }), false);
  assert.equal(isValidJob({ ...baseJob, code: "x".repeat(50001) }), false);
});

test("rejects missing, empty, or excessive test cases", () => {
  assert.equal(isValidJob({ ...baseJob, testCases: [] }), false);
  assert.equal(isValidJob({ ...baseJob, testCases: Array.from({ length: 1001 }, () => baseJob.testCases[0]) }), false);
});

test("rejects oversized test input and expected output", () => {
  assert.equal(isValidJob({ ...baseJob, testCases: [{ input: "x".repeat(50001), expectedOutput: "ok" }] }), false);
  assert.equal(isValidJob({ ...baseJob, testCases: [{ input: "{}", expectedOutput: "x".repeat(100001) }] }), false);
});

test("rejects malformed test-case fields", () => {
  assert.equal(isValidJob({ ...baseJob, testCases: [{ input: {}, expectedOutput: "true" }] }), false);
  assert.equal(isValidJob({ ...baseJob, testCases: [{ input: "{}", expectedOutput: 123 }] }), false);
});
