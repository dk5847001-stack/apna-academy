import assert from "node:assert/strict";
import test from "node:test";
import { buildInterviewAnalytics } from "../src/services/interviewAnalytics.service.js";

test("buildInterviewAnalytics derives deterministic metrics from saved answers", () => {
  const analytics = buildInterviewAnalytics(
    [
      { questionId: "q1", category: "Node.js", answer: "A".repeat(100), score: 90 },
      { questionId: "q2", category: "JavaScript", answer: "B".repeat(50), score: 70 },
      { questionId: "q2-f", category: "JavaScript", answer: "C".repeat(80), score: 80 },
    ],
    [
      { id: "q1", category: "Node.js", isFollowUp: false },
      { id: "q2", category: "JavaScript", isFollowUp: false },
      { id: "q2-f", category: "JavaScript", isFollowUp: true },
    ],
    { questionCount: 2 }
  );

  assert.equal(analytics.answeredCount, 3);
  assert.equal(analytics.plannedQuestionCount, 2);
  assert.equal(analytics.followUpCount, 1);
  assert.equal(analytics.completionRate, 100);
  assert.equal(analytics.averageAnswerScore, 80);
  assert.equal(analytics.scoreRange, 20);
  assert.equal(analytics.averageAnswerLength, 77);
  assert.equal(analytics.strongestCategory, "Node.js");
  assert.equal(analytics.focusCategory, "JavaScript");
});
