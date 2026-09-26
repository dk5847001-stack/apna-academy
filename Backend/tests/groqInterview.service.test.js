import assert from "node:assert/strict";
import test from "node:test";

process.env.GROQ_API_KEY = "test-key";
process.env.INTERVIEW_GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
process.env.INTERVIEW_GROQ_MODEL = "openai/gpt-oss-20b";
process.env.INTERVIEW_GROQ_TIMEOUT_MS = "120000";

const originalFetch = global.fetch;

const setup = {
  role: "Backend Developer",
  interviewType: "technical",
  experience: "fresher",
  difficulty: "medium",
  questionCount: 2,
  durationMinutes: 30,
};

const questionPayload = {
  questions: [
    {
      id: "q1",
      category: "Node.js",
      question: "Explain the Node.js event loop.",
      hint: "Discuss asynchronous execution.",
    },
    {
      id: "q2",
      category: "JavaScript",
      question: "What is a Promise?",
      hint: "Explain state and handlers.",
    },
  ],
};

const evaluationPayload = {
  score: 85,
  feedback: "The answer is technically sound and relevant.",
  strengths: ["Correct explanation"],
  improvements: ["Add a concrete example"],
  spokenResponse: "Good explanation. You correctly identified the event loop's role; now let's probe how you would diagnose blocking.",
  followUpQuestion: "How would you debug event-loop blocking?",
  nextCategory: "Node.js",
};

const reportPayload = {
  overallScore: 85,
  technical: 88,
  communication: 82,
  confidence: 80,
  problemSolving: 84,
  strengths: ["Good fundamentals"],
  improvements: ["More concrete examples"],
  recommendations: ["Practice system design explanations"],
  summary: "Strong foundational interview performance.",
};

function mockResponse(payload) {
  return new Response(
    JSON.stringify({
      choices: [{ message: { role: "assistant", content: JSON.stringify(payload) } }],
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

test.before(async () => {
  global.fetch = async (_url, options) => {
    const body = JSON.parse(options.body);
    const userMessage = body.messages.at(-1)?.content || "";

    assert.equal(body.model, "openai/gpt-oss-20b");
    assert.equal(body.reasoning_effort, "low");
    assert.equal(body.include_reasoning, false);
    assert.ok(body.response_format);

    if (userMessage.includes("Create exactly")) return mockResponse(questionPayload);
    if (userMessage.includes("Evaluate the candidate")) return mockResponse(evaluationPayload);
    if (userMessage.includes("Create a final performance report")) return mockResponse(reportPayload);

    throw new Error("Unexpected mocked Groq request");
  };
});

test.after(() => {
  global.fetch = originalFetch;
});

test("opening questions are generated and validated", async () => {
  const { generateOpeningQuestions } = await import("../src/services/groqInterview.service.js");
  const questions = await generateOpeningQuestions(setup);

  assert.equal(questions.length, 2);
  assert.equal(questions[0].id, "q1");
  assert.equal(questions[1].category, "JavaScript");
});

test("answer evaluation is generated and normalized", async () => {
  const { evaluateAnswer } = await import("../src/services/groqInterview.service.js");
  const evaluation = await evaluateAnswer({
    setup,
    question: questionPayload.questions[0],
    answer: "The event loop coordinates asynchronous callbacks.",
    questionIndex: 0,
    totalQuestions: 2,
  });

  assert.equal(evaluation.score, 85);
  assert.equal(evaluation.spokenResponse, evaluationPayload.spokenResponse);
  assert.equal(evaluation.spokenResponse.length <= 450, true);
  assert.equal(evaluation.followUpQuestion.length > 0, true);
});

test("final report is generated and scores stay bounded", async () => {
  const { buildFinalReport } = await import("../src/services/groqInterview.service.js");
  const report = await buildFinalReport({
    setup,
    answers: [
      {
        category: "Node.js",
        score: 85,
        feedback: "Good answer",
        strengths: ["Correct"],
        improvements: ["Example"],
      },
    ],
  });

  assert.equal(report.overallScore, 85);
  assert.equal(report.technical, 88);
  assert.ok(report.recommendations.length > 0);
});
