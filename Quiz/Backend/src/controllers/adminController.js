const mongoose = require('mongoose')
const { z } = require('zod')
const Quiz = require('../models/Quiz')
const Question = require('../models/Question')
const Participant = require('../models/Participant')
const Attempt = require('../models/Attempt')
const { HttpError } = require('../utils/httpError')

const objectId = z.string().refine((v) => mongoose.isValidObjectId(v), 'Invalid id')
const quizSchema = z.object({
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must use lowercase letters, numbers and hyphens.'),
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().min(2).max(1000),
  type: z.enum(['Practice Quiz','Subject Test','Placement Test','Competitive Quiz','Mock Test','College Test','Certification Test','Live Quiz']),
  degree: z.string().trim().min(1).max(80),
  branch: z.string().trim().min(1).max(120),
  subject: z.string().trim().min(1).max(120),
  difficulty: z.enum(['Easy','Medium','Hard','Mixed']),
  durationSeconds: z.coerce.number().int().min(60).max(14400),
  marks: z.coerce.number().positive().max(10000),
  negativeMarks: z.coerce.number().min(0).max(100).default(0),
  maxAttempts: z.coerce.number().int().min(1).max(100).default(1),
  resultMode: z.enum(['immediate','manual']).default('immediate'),
  tags: z.array(z.string().trim().min(1).max(60)).max(30).default([]),
  isPublished: z.boolean().default(false),
})
const questionSchema = z.object({
  position: z.coerce.number().int().min(1),
  topic: z.string().trim().max(120).default(''),
  text: z.string().trim().min(2).max(2000),
  options: z.array(z.object({ key: z.enum(['A','B','C','D']), text: z.string().trim().min(1).max(500) })).min(2).max(4),
  correctOption: z.enum(['A','B','C','D']),
  marks: z.coerce.number().min(0).max(1000).default(1),
  explanation: z.string().trim().max(1500).default(''),
  isActive: z.boolean().default(true),
})

function cleanQuiz(q) {
  return { id:q._id.toString(), slug:q.slug, title:q.title, description:q.description, type:q.type, degree:q.degree, branch:q.branch, subject:q.subject, difficulty:q.difficulty, durationSeconds:q.durationSeconds, marks:q.marks, negativeMarks:q.negativeMarks, maxAttempts:q.maxAttempts, isPublished:q.isPublished, resultMode:q.resultMode, tags:q.tags, createdAt:q.createdAt, updatedAt:q.updatedAt }
}
function cleanQuestion(q) {
  return { id:q._id.toString(), quizId:q.quizId.toString(), position:q.position, topic:q.topic || '', text:q.text, options:q.options, correctOption:q.correctOption, marks:q.marks, explanation:q.explanation || '', isActive:q.isActive, createdAt:q.createdAt, updatedAt:q.updatedAt }
}

async function dashboard(req,res) {
  const [quizzes, published, questions, participants, attempts, completed] = await Promise.all([
    Quiz.countDocuments(), Quiz.countDocuments({isPublished:true}), Question.countDocuments({isActive:true}), Participant.countDocuments(), Attempt.countDocuments(), Attempt.countDocuments({status:{$in:['SUBMITTED','EXPIRED']}})
  ])
  res.json({success:true,data:{counts:{quizzes,published,questions,participants,attempts,completed}}})
}

async function listQuizzes(req,res) {
  const filter={}
  if(req.query.search) filter.$or=[{title:new RegExp(req.query.search.trim(),'i')},{slug:new RegExp(req.query.search.trim(),'i')},{subject:new RegExp(req.query.search.trim(),'i')}]
  if(req.query.published==='true') filter.isPublished=true
  if(req.query.published==='false') filter.isPublished=false
  const quizzes=await Quiz.find(filter).sort({updatedAt:-1}).lean()
  const ids=quizzes.map(q=>q._id)
  const counts=await Question.aggregate([{ $match:{quizId:{$in:ids},isActive:true}},{ $group:{_id:'$quizId',count:{$sum:1}}}])
  const countMap=new Map(counts.map(x=>[x._id.toString(),x.count]))
  res.json({success:true,data:{quizzes:quizzes.map(q=>({...cleanQuiz(q),questionCount:countMap.get(q._id.toString())||0}))}})
}

async function createQuiz(req,res) {
  const data=quizSchema.parse(req.body)
  const exists=await Quiz.findOne({$or:[{slug:data.slug},{title:data.title}]})
  if(exists) throw new HttpError(409,'A quiz with this slug or title already exists.','QUIZ_EXISTS')
  const quiz=await Quiz.create(data)
  res.status(201).json({success:true,data:{quiz:cleanQuiz(quiz)}})
}
async function getQuiz(req,res) {
  if(!mongoose.isValidObjectId(req.params.quizId)) throw new HttpError(400,'Invalid quiz id.','INVALID_ID')
  const quiz=await Quiz.findById(req.params.quizId).lean()
  if(!quiz) throw new HttpError(404,'Quiz not found.','QUIZ_NOT_FOUND')
  const questionCount=await Question.countDocuments({quizId:quiz._id,isActive:true})
  res.json({success:true,data:{quiz:{...cleanQuiz(quiz),questionCount}}})
}
async function updateQuiz(req,res) {
  if(!mongoose.isValidObjectId(req.params.quizId)) throw new HttpError(400,'Invalid quiz id.','INVALID_ID')
  const data=quizSchema.partial().parse(req.body)
  const quiz=await Quiz.findById(req.params.quizId)
  if(!quiz) throw new HttpError(404,'Quiz not found.','QUIZ_NOT_FOUND')
  if(data.slug && data.slug!==quiz.slug && await Quiz.exists({slug:data.slug})) throw new HttpError(409,'Quiz slug already exists.','QUIZ_SLUG_EXISTS')
  if(data.isPublished===true) {
    const count=await Question.countDocuments({quizId:quiz._id,isActive:true})
    if(count===0) throw new HttpError(409,'A quiz must have at least one active question before publishing.','QUIZ_HAS_NO_QUESTIONS')
  }
  Object.assign(quiz,data)
  await quiz.save()
  res.json({success:true,data:{quiz:cleanQuiz(quiz)}})
}
async function archiveQuiz(req,res) {
  if(!mongoose.isValidObjectId(req.params.quizId)) throw new HttpError(400,'Invalid quiz id.','INVALID_ID')
  const quiz=await Quiz.findByIdAndUpdate(req.params.quizId,{isPublished:false},{new:true})
  if(!quiz) throw new HttpError(404,'Quiz not found.','QUIZ_NOT_FOUND')
  res.json({success:true,data:{quiz:cleanQuiz(quiz)}})
}

async function listQuestions(req,res) {
  if(!mongoose.isValidObjectId(req.params.quizId)) throw new HttpError(400,'Invalid quiz id.','INVALID_ID')
  const questions=await Question.find({quizId:req.params.quizId}).sort({position:1}).lean()
  res.json({success:true,data:{questions:questions.map(cleanQuestion)}})
}
async function createQuestion(req,res) {
  if(!mongoose.isValidObjectId(req.params.quizId)) throw new HttpError(400,'Invalid quiz id.','INVALID_ID')
  if(!await Quiz.exists({_id:req.params.quizId})) throw new HttpError(404,'Quiz not found.','QUIZ_NOT_FOUND')
  const data=questionSchema.parse(req.body)
  const keys=new Set(data.options.map(o=>o.key))
  if(!keys.has(data.correctOption)) throw new HttpError(400,'Correct option must exist in the options.','INVALID_CORRECT_OPTION')
  if(data.options.length===2 && data.correctOption>'B') throw new HttpError(400,'Correct option must be one of the provided options.','INVALID_CORRECT_OPTION')
  if(await Question.exists({quizId:req.params.quizId,position:data.position})) throw new HttpError(409,'Question position already exists.','QUESTION_POSITION_EXISTS')
  const question=await Question.create({...data,quizId:req.params.quizId})
  res.status(201).json({success:true,data:{question:cleanQuestion(question)}})
}
async function updateQuestion(req,res) {
  if(!mongoose.isValidObjectId(req.params.questionId)) throw new HttpError(400,'Invalid question id.','INVALID_ID')
  const data=questionSchema.partial().parse(req.body)
  const question=await Question.findById(req.params.questionId)
  if(!question) throw new HttpError(404,'Question not found.','QUESTION_NOT_FOUND')
  if(data.options || data.correctOption) {
    const options=data.options || question.options
    const correct=data.correctOption || question.correctOption
    if(!options.some(o=>o.key===correct)) throw new HttpError(400,'Correct option must exist in the options.','INVALID_CORRECT_OPTION')
  }
  if(data.position && data.position!==question.position && await Question.exists({quizId:question.quizId,position:data.position,_id:{$ne:question._id}})) throw new HttpError(409,'Question position already exists.','QUESTION_POSITION_EXISTS')
  Object.assign(question,data)
  await question.save()
  res.json({success:true,data:{question:cleanQuestion(question)}})
}
async function deactivateQuestion(req,res) {
  if(!mongoose.isValidObjectId(req.params.questionId)) throw new HttpError(400,'Invalid question id.','INVALID_ID')
  const question=await Question.findByIdAndUpdate(req.params.questionId,{isActive:false},{new:true})
  if(!question) throw new HttpError(404,'Question not found.','QUESTION_NOT_FOUND')
  res.json({success:true,data:{question:cleanQuestion(question)}})
}

async function listParticipants(req,res) {
  const search=req.query.search?.trim()
  const filter=search?{$or:[{name:new RegExp(search,'i')},{email:new RegExp(search,'i')},{rollNumber:new RegExp(search,'i')},{college:new RegExp(search,'i')}]}:{}
  const participants=await Participant.find(filter).select('-__v').sort({createdAt:-1}).limit(200).lean()
  res.json({success:true,data:{participants:participants.map(p=>({...p,id:p._id.toString()}))}})
}
async function listAttempts(req,res) {
  const filter={}
  if(req.query.status) filter.status=req.query.status
  if(req.query.quizId && mongoose.isValidObjectId(req.query.quizId)) filter.quizId=req.query.quizId
  const attempts=await Attempt.find(filter).select('participantId quizId status startedAt submittedAt expiresAt durationSeconds result').sort({createdAt:-1}).limit(300).lean()
  const pids=[...new Set(attempts.map(a=>a.participantId.toString()))]
  const qids=[...new Set(attempts.map(a=>a.quizId.toString()))]
  const [participants,quizzes]=await Promise.all([Participant.find({_id:{$in:pids}}).select('name email college').lean(),Quiz.find({_id:{$in:qids}}).select('title slug').lean()])
  const pm=new Map(participants.map(p=>[p._id.toString(),p])), qm=new Map(quizzes.map(q=>[q._id.toString(),q]))
  res.json({success:true,data:{attempts:attempts.map(a=>({id:a._id.toString(),status:a.status,startedAt:a.startedAt,submittedAt:a.submittedAt,expiresAt:a.expiresAt,durationSeconds:a.durationSeconds,result:a.result,participant:pm.get(a.participantId.toString())||null,quiz:qm.get(a.quizId.toString())||null}))}})
}
async function listResults(req,res) {
  const attempts=await Attempt.find({status:{$in:['SUBMITTED','EXPIRED']}}).select('participantId quizId status submittedAt result durationSeconds').sort({submittedAt:-1}).limit(300).lean()
  const pids=[...new Set(attempts.map(a=>a.participantId.toString()))],qids=[...new Set(attempts.map(a=>a.quizId.toString()))]
  const [participants,quizzes]=await Promise.all([Participant.find({_id:{$in:pids}}).select('name email college').lean(),Quiz.find({_id:{$in:qids}}).select('title slug').lean()])
  const pm=new Map(participants.map(p=>[p._id.toString(),p])),qm=new Map(quizzes.map(q=>[q._id.toString(),q]))
  res.json({success:true,data:{results:attempts.map(a=>({attemptId:a._id.toString(),status:a.status,submittedAt:a.submittedAt,result:a.result,participant:pm.get(a.participantId.toString())||null,quiz:qm.get(a.quizId.toString())||null}))}})
}

module.exports={dashboard,listQuizzes,createQuiz,getQuiz,updateQuiz,archiveQuiz,listQuestions,createQuestion,updateQuestion,deactivateQuestion,listParticipants,listAttempts,listResults}