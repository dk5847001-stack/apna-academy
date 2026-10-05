const mongoose = require('mongoose')
const Attempt = require('../models/Attempt')
const Quiz = require('../models/Quiz')
const { HttpError } = require('../utils/httpError')

function buildAnalytics(attempt, quiz) {
  const questions = attempt.snapshot || []
  const answers = attempt.answers || []
  const answerMap = new Map(answers.map((answer) => [answer.questionId.toString(), answer.selectedOption]))
  const topicMap = new Map()

  let maxMarks = 0
  let attempted = 0
  let correct = 0
  let incorrect = 0
  let skipped = 0

  for (const question of questions) {
    const topic = question.topic || quiz?.subject || 'General'
    const selected = answerMap.get(question.questionId.toString())
    const hasAnswer = Boolean(selected)
    maxMarks += Number(question.marks || 0)

    const topicStats = topicMap.get(topic) || { topic, total: 0, attempted: 0, correct: 0, incorrect: 0, skipped: 0, marks: 0 }
    topicStats.total += 1
    topicStats.marks += Number(question.marks || 0)

    if (!hasAnswer) {
      skipped += 1
      topicStats.skipped += 1
    } else if (selected === question.correctOption) {
      attempted += 1
      correct += 1
      topicStats.attempted += 1
      topicStats.correct += 1
    } else {
      attempted += 1
      incorrect += 1
      topicStats.attempted += 1
      topicStats.incorrect += 1
    }

    topicMap.set(topic, topicStats)
  }

  const score = Number(attempt.result?.score ?? 0)
  const percentage = maxMarks ? Number(((score / maxMarks) * 100).toFixed(2)) : 0
  const accuracy = attempted ? Number(((correct / attempted) * 100).toFixed(2)) : 0
  const timeUsedSeconds = Number(attempt.result?.timeUsedSeconds ?? 0)
  const durationSeconds = Number(attempt.durationSeconds || quiz?.durationSeconds || 0)
  const timeRemainingSeconds = Math.max(0, durationSeconds - timeUsedSeconds)
  const passed = Boolean(attempt.result?.passed)
  const showExplanations = attempt.rules?.showExplanations !== false

  const topicPerformance = [...topicMap.values()].map((item) => ({
    ...item,
    accuracy: item.attempted ? Number(((item.correct / item.attempted) * 100).toFixed(2)) : 0,
  }))

  const suggestions = []
  if (percentage < 40) suggestions.push('Revisit the core concepts before attempting another test.')
  else if (percentage < 60) suggestions.push('Review incorrect questions and strengthen the weaker topics.')
  else if (percentage < 80) suggestions.push('Keep practicing your weaker topics and aim for more consistent accuracy.')
  else suggestions.push('Strong attempt. Use targeted practice to turn this performance into consistent mastery.')

  const weakest = [...topicPerformance]
    .filter((item) => item.attempted > 0)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 2)

  if (weakest.length) {
    suggestions.push('Prioritize ' + weakest.map((item) => item.topic).join(' and ') + ' in your next study session.')
  }
  if (skipped > 0) suggestions.push('You skipped ' + skipped + ' question' + (skipped === 1 ? '' : 's') + '. Try to reduce unanswered questions when time allows.')

  return {
    attemptId: attempt._id.toString(),
    status: attempt.status,
    submittedAt: attempt.submittedAt,
    quiz: quiz ? {
      id: quiz._id.toString(),
      slug: quiz.slug,
      title: quiz.title,
      type: quiz.type,
      subject: quiz.subject,
      difficulty: quiz.difficulty,
      durationSeconds: quiz.durationSeconds,
    } : null,
    score,
    maxMarks,
    percentage,
    correct,
    incorrect,
    skipped,
    attempted,
    accuracy,
    timeUsedSeconds,
    timeRemainingSeconds,
    passed,
    passingPercentage: Number(attempt.rules?.passingPercentage ?? quiz?.passingPercentage ?? 40),
    questionCount: questions.length,
    topicPerformance,
    suggestions,
    questionReview: showExplanations === false ? [] : questions.map((question) => { const selected=answerMap.get(question.questionId.toString()) || null; return { questionId:question.questionId.toString(), position:question.position, text:question.text, selectedOption:selected, correctOption:question.correctOption, correct:Boolean(selected && selected===question.correctOption), explanation:question.explanation || '' } }),
  }
}

async function getResult(req, res) {
  const { attemptId } = req.params
  const { participantId } = req.query

  if (!mongoose.isValidObjectId(attemptId) || !mongoose.isValidObjectId(participantId)) {
    throw new HttpError(400, 'A valid attemptId and participantId are required.', 'INVALID_ID')
  }

  const attempt = await Attempt.findOne({ _id: attemptId, participantId })
  if (!attempt) throw new HttpError(404, 'Result not found for this participant.', 'RESULT_NOT_FOUND')
  if (!['SUBMITTED', 'EXPIRED'].includes(attempt.status)) {
    throw new HttpError(409, 'This attempt has not been completed yet.', 'RESULT_NOT_READY')
  }

  const quiz = await Quiz.findById(attempt.quizId).select('slug title type subject difficulty durationSeconds passingPercentage showExplanations')
  res.json({ success: true, data: { result: buildAnalytics(attempt, quiz) } })
}

async function listResults(req, res) {
  const { participantId } = req.query
  if (!mongoose.isValidObjectId(participantId)) {
    throw new HttpError(400, 'A valid participantId is required.', 'INVALID_PARTICIPANT_ID')
  }

  const attempts = await Attempt.find({
    participantId,
    status: { $in: ['SUBMITTED', 'EXPIRED'] },
  }).sort({ submittedAt: -1 }).limit(50).lean()

  const quizIds = [...new Set(attempts.map((attempt) => attempt.quizId.toString()))]
  const quizzes = await Quiz.find({ _id: { $in: quizIds } }).select('slug title type subject difficulty durationSeconds').lean()
  const quizMap = new Map(quizzes.map((quiz) => [quiz._id.toString(), quiz]))

  const results = attempts.map((attempt) => buildAnalytics(attempt, quizMap.get(attempt.quizId.toString())))
  res.json({ success: true, data: { results } })
}

module.exports = { getResult, listResults }
