const mongoose = require('mongoose')
const Attempt = require('../models/Attempt')
const Quiz = require('../models/Quiz')
const { HttpError } = require('../utils/httpError')

const COMPLETED = ['SUBMITTED', 'EXPIRED']

function publicName(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'Anonymous'
  return parts.length === 1 ? parts[0] : parts[0] + ' ' + parts[parts.length - 1].charAt(0) + '.'
}

function rankRows(rows) {
  const sorted = rows.sort((a, b) =>
    b.averagePercentage - a.averagePercentage ||
    b.quizzesCompleted - a.quizzesCompleted ||
    b.averageAccuracy - a.averageAccuracy ||
    a.averageTimeUsedSeconds - b.averageTimeUsedSeconds ||
    new Date(a.lastSubmittedAt) - new Date(b.lastSubmittedAt)
  )
  let previousKey = ''
  let previousRank = 0
  return sorted.map((row, index) => {
    const key = [row.averagePercentage.toFixed(2), row.quizzesCompleted, row.averageAccuracy.toFixed(2), row.averageTimeUsedSeconds.toFixed(2)].join('|')
    const rank = key === previousKey ? previousRank : index + 1
    previousKey = key
    previousRank = rank
    return { ...row, rank }
  })
}

async function getLeaderboard(req, res) {
  const scope = ['overall', 'quiz', 'subject', 'degree', 'branch', 'college'].includes(req.query.scope) ? req.query.scope : 'overall'
  const quizSlug = req.query.quizSlug?.trim().toLowerCase()
  const subject = req.query.subject?.trim()
  const degree = req.query.degree?.trim()
  const branch = req.query.branch?.trim()
  const college = req.query.college?.trim()
  const participantId = req.query.participantId
  const limitValue = Number.parseInt(req.query.limit || '50', 10)
  const pageValue = Number.parseInt(req.query.page || '1', 10)
  const limit = Math.min(Math.max(Number.isFinite(limitValue) ? limitValue : 50, 1), 100)
  const page = Math.max(Number.isFinite(pageValue) ? pageValue : 1, 1)

  if (participantId && !mongoose.isValidObjectId(participantId)) throw new HttpError(400, 'Invalid participantId.', 'INVALID_PARTICIPANT_ID')

  let quizId = null
  if (quizSlug) {
    const quiz = await Quiz.findOne({ slug: quizSlug, isPublished: true }).select('_id').lean()
    if (!quiz) throw new HttpError(404, 'Quiz not found.', 'QUIZ_NOT_FOUND')
    quizId = quiz._id
  }

  const match = { status: { $in: COMPLETED } }
  if (quizId) match.quizId = quizId

  const pipeline = [
    { $match: match },
    { $lookup: { from: 'quizquizzes', localField: 'quizId', foreignField: '_id', as: 'quiz' } },
    { $unwind: '$quiz' },
    { $lookup: { from: 'quizparticipants', localField: 'participantId', foreignField: '_id', as: 'participant' } },
    { $unwind: '$participant' },
    { $match: { 'quiz.isPublished': true, ...(subject ? { 'quiz.subject': subject } : {}), ...(degree ? { 'quiz.degree': degree } : {}), ...(branch ? { 'quiz.branch': branch } : {}), ...(college ? { 'participant.college': college } : {}) } },
    { $project: {
      participantId: 1, quizId: 1,
      score: { $ifNull: ['$result.score', 0] },
      percentage: { $ifNull: ['$result.percentage', 0] },
      accuracy: { $ifNull: ['$result.accuracy', 0] },
      timeUsedSeconds: { $ifNull: ['$result.timeUsedSeconds', '$durationSeconds'] },
      submittedAt: 1, name: '$participant.name', college: '$participant.college'
    } },
    { $sort: { participantId: 1, quizId: 1, percentage: -1, accuracy: -1, timeUsedSeconds: 1, submittedAt: 1 } },
    { $group: { _id: { participantId: '$participantId', quizId: '$quizId' }, score: { $first: '$score' }, percentage: { $first: '$percentage' }, accuracy: { $first: '$accuracy' }, timeUsedSeconds: { $first: '$timeUsedSeconds' }, submittedAt: { $first: '$submittedAt' }, name: { $first: '$name' }, college: { $first: '$college' } } },
    { $group: { _id: '$_id.participantId', averagePercentage: { $avg: '$percentage' }, averageAccuracy: { $avg: '$accuracy' }, totalScore: { $sum: '$score' }, quizzesCompleted: { $sum: 1 }, averageTimeUsedSeconds: { $avg: '$timeUsedSeconds' }, lastSubmittedAt: { $max: '$submittedAt' }, name: { $first: '$name' }, college: { $first: '$college' } } },
    { $project: { _id: 0, participantId: '$_id', averagePercentage: { $round: ['$averagePercentage', 2] }, averageAccuracy: { $round: ['$averageAccuracy', 2] }, totalScore: { $round: ['$totalScore', 2] }, quizzesCompleted: 1, averageTimeUsedSeconds: { $round: ['$averageTimeUsedSeconds', 2] }, lastSubmittedAt: 1, displayName: '$name', college: 1 } }
  ]

  const rows = await Attempt.aggregate(pipeline)
  const ranked = rankRows(rows.map((row) => ({ ...row, displayName: publicName(row.displayName) })))
  const totalParticipants = ranked.length
  const start = (page - 1) * limit
  const entries = ranked.slice(start, start + limit).map((row) => ({
    rank: row.rank, participantId: row.participantId.toString(), displayName: row.displayName, college: row.college,
    averagePercentage: row.averagePercentage, averageAccuracy: row.averageAccuracy, totalScore: row.totalScore,
    quizzesCompleted: row.quizzesCompleted, averageTimeUsedSeconds: row.averageTimeUsedSeconds
  }))

  let me = null
  if (participantId) {
    const own = ranked.find((row) => row.participantId.toString() === participantId)
    if (own) me = { rank: own.rank, displayName: own.displayName, averagePercentage: own.averagePercentage, averageAccuracy: own.averageAccuracy, totalScore: own.totalScore, quizzesCompleted: own.quizzesCompleted, averageTimeUsedSeconds: own.averageTimeUsedSeconds }
  }

  res.json({ success: true, data: {
    scope,
    filters: { quizSlug: quizSlug || null, subject: subject || null, degree: degree || null, branch: branch || null, college: college || null },
    ranking: { metric: 'average_percentage', tieBreakers: ['quizzes_completed', 'average_accuracy', 'average_time_used_seconds', 'earlier_submission'], rankMethod: 'competition' },
    pagination: { page, limit, totalParticipants, totalPages: Math.ceil(totalParticipants / limit) },
    entries, me
  }})
}

module.exports = { getLeaderboard }
