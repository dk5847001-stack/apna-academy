const clamp = (value) => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));

const average = (values) => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;

export function buildInterviewAnalytics(answers = [], questions = [], setup = {}) {
  const safeAnswers = Array.isArray(answers) ? answers : [];
  const safeQuestions = Array.isArray(questions) ? questions : [];
  const plannedQuestions = safeQuestions.filter((item) => !item.isFollowUp);
  const answered = safeAnswers.filter((item) => String(item.answer || "").trim().length > 0);
  const followUps = safeAnswers.filter((item) => safeQuestions.find((q) => q.id === item.questionId)?.isFollowUp);
  const scores = answered.map((item) => clamp(item.score));
  const categories = new Map();

  for (const item of answered) {
    const category = String(item.category || "General").trim().slice(0, 100) || "General";
    const bucket = categories.get(category) || [];
    bucket.push(clamp(item.score));
    categories.set(category, bucket);
  }

  const categoryScores = [...categories.entries()]
    .map(([category, values]) => ({ category, score: average(values), answerCount: values.length }))
    .sort((a, b) => b.score - a.score);

  const lengths = answered.map((item) => String(item.answer || "").trim().length);
  const minScore = scores.length ? Math.min(...scores) : 0;
  const maxScore = scores.length ? Math.max(...scores) : 0;

  return {
    answeredCount: answered.length,
    plannedQuestionCount: plannedQuestions.length || Number(setup.questionCount) || 0,
    followUpCount: followUps.length,
    completionRate: plannedQuestions.length ? Math.round((answered.filter((item) => {
      const question = safeQuestions.find((q) => q.id === item.questionId);
      return question && !question.isFollowUp;
    }).length / plannedQuestions.length) * 100) : 0,
    averageAnswerScore: average(scores),
    consistencyScore: scores.length ? clamp(100 - (maxScore - minScore)) : 0,
    scoreRange: maxScore - minScore,
    averageAnswerLength: average(lengths),
    categoryScores,
    strongestCategory: categoryScores[0]?.category || "",
    focusCategory: categoryScores.length ? categoryScores[categoryScores.length - 1].category : "",
    generatedAt: new Date(),
  };
}
