const mongoose=require('mongoose')
const {z}=require('zod')
const Participant=require('../models/Participant')
const Quiz=require('../models/Quiz')
const Question=require('../models/Question')
const Attempt=require('../models/Attempt')
const {HttpError}=require('../utils/httpError')

const idSchema=z.string().refine(v=>mongoose.isValidObjectId(v),'Invalid id')
const startSchema=z.object({participantId:idSchema,quizId:idSchema})
const answerSchema=z.object({selectedOption:z.enum(['A','B','C','D']).nullable()})

function safeAttempt(attempt){
 return {id:attempt._id.toString(),quizId:attempt.quizId.toString(),participantId:attempt.participantId.toString(),status:attempt.status,startedAt:attempt.startedAt,expiresAt:attempt.expiresAt,durationSeconds:attempt.durationSeconds,questions:attempt.snapshot.map(q=>({questionId:q.questionId.toString(),position:q.position,topic:q.topic || quiz.subject,text:q.text,options:q.options,marks:q.marks})),answers:attempt.answers.map(a=>({questionId:a.questionId.toString(),selectedOption:a.selectedOption}))}
}
function resultPayload(attempt){
 return {attemptId:attempt._id.toString(),status:attempt.status,...attempt.result}
}
async function startAttempt(req,res){
 const {participantId,quizId}=startSchema.parse(req.body)
 const [participant,quiz]=await Promise.all([Participant.findById(participantId),Quiz.findOne({_id:quizId,isPublished:true})])
 if(!participant) throw new HttpError(404,'Participant not found.','PARTICIPANT_NOT_FOUND')
 if(!quiz) throw new HttpError(404,'Published quiz not found.','QUIZ_NOT_FOUND')
 const active=await Attempt.findOne({participantId,quizId,status:{$in:['CREATED','STARTED','IN_PROGRESS']}})
 if(active) return res.status(200).json({success:true,data:{attempt:safeAttempt(active),resumed:true}})
 const attempts=await Attempt.countDocuments({participantId,quizId,status:{$in:['SUBMITTED','EXPIRED']}})
 if(attempts>=quiz.maxAttempts) throw new HttpError(409,'Maximum attempts reached for this quiz.','ATTEMPT_LIMIT_REACHED')
 const questions=await Question.find({quizId,isActive:true}).sort({position:1}).lean()
 if(!questions.length) throw new HttpError(409,'This quiz has no active questions.','NO_QUESTIONS')
 const now=new Date()
 const snapshot=questions.map(q=>({questionId:q._id,position:q.position,text:q.text,options:q.options.map(o=>({key:o.key,text:o.text})),correctOption:q.correctOption,marks:q.marks,negativeMarks:quiz.negativeMarks}))
 const attempt=await Attempt.create({participantId,quizId,status:'IN_PROGRESS',startedAt:now,expiresAt:new Date(now.getTime()+quiz.durationSeconds*1000),durationSeconds:quiz.durationSeconds,snapshot})
 res.status(201).json({success:true,data:{attempt:safeAttempt(attempt),resumed:false}})
}
async function getAttempt(req,res){
 if(!mongoose.isValidObjectId(req.params.attemptId)) throw new HttpError(400,'Invalid attempt id.','INVALID_ID')
 const attempt=await Attempt.findById(req.params.attemptId)
 if(!attempt) throw new HttpError(404,'Attempt not found.','ATTEMPT_NOT_FOUND')
 if(['IN_PROGRESS','STARTED','CREATED'].includes(attempt.status)&&attempt.expiresAt&&Date.now()>=attempt.expiresAt.getTime()) await expireAndScore(attempt)
 res.json({success:true,data:{attempt:safeAttempt(attempt)}})
}
async function saveAnswer(req,res){
 if(!mongoose.isValidObjectId(req.params.attemptId)) throw new HttpError(400,'Invalid attempt id.','INVALID_ID')
 const {questionId}=req.params
 const {selectedOption}=answerSchema.parse(req.body)
 const attempt=await Attempt.findById(req.params.attemptId)
 if(!attempt) throw new HttpError(404,'Attempt not found.','ATTEMPT_NOT_FOUND')
 if(attempt.status!=='IN_PROGRESS') throw new HttpError(409,'This attempt is no longer accepting answers.','ATTEMPT_CLOSED')
 if(attempt.expiresAt&&Date.now()>=attempt.expiresAt.getTime()){await expireAndScore(attempt);throw new HttpError(409,'Time has expired for this attempt.','ATTEMPT_EXPIRED')}
 const question=attempt.snapshot.find(q=>q.questionId.toString()===questionId)
 if(!question) throw new HttpError(400,'Question does not belong to this attempt.','QUESTION_NOT_IN_ATTEMPT')
 const existing=attempt.answers.find(a=>a.questionId.toString()===questionId)
 if(existing){existing.selectedOption=selectedOption;existing.answeredAt=new Date()}else attempt.answers.push({questionId:new mongoose.Types.ObjectId(questionId),selectedOption,answeredAt:new Date()})
 await attempt.save()
 res.json({success:true,data:{questionId,selectedOption}})
}
async function scoreAttempt(attempt,expired=false){
 let score=0,correct=0,incorrect=0,skipped=0
 for(const q of attempt.snapshot){
  const answer=attempt.answers.find(a=>a.questionId.toString()===q.questionId.toString())
  if(!answer||!answer.selectedOption){skipped++;continue}
  if(answer.selectedOption===q.correctOption){correct++;score+=q.marks}
  else{incorrect++;score-=q.negativeMarks||0}
 }
 const maxMarks=attempt.snapshot.reduce((sum,q)=>sum+q.marks,0)
 score=Math.max(0,score)
 const started=attempt.startedAt?.getTime()||Date.now()
 const end=Math.min(Date.now(),attempt.expiresAt?.getTime()||Date.now())
 const timeUsedSeconds=Math.max(0,Math.round((end-started)/1000))
 attempt.result={score,percentage:maxMarks?Number(((score/maxMarks)*100).toFixed(2)):0,correct,incorrect,skipped,accuracy:correct+incorrect?Number(((correct/(correct+incorrect))*100).toFixed(2)):0,timeUsedSeconds}
 attempt.status=expired?'EXPIRED':'SUBMITTED'
 attempt.submittedAt=new Date()
 await attempt.save()
 return attempt
}
async function expireAndScore(attempt){return scoreAttempt(attempt,true)}
async function submitAttempt(req,res){
 if(!mongoose.isValidObjectId(req.params.attemptId)) throw new HttpError(400,'Invalid attempt id.','INVALID_ID')
 const attempt=await Attempt.findById(req.params.attemptId)
 if(!attempt) throw new HttpError(404,'Attempt not found.','ATTEMPT_NOT_FOUND')
 if(['SUBMITTED','EXPIRED'].includes(attempt.status)) return res.json({success:true,data:{result:resultPayload(attempt)}})
 if(attempt.status!=='IN_PROGRESS') throw new HttpError(409,'This attempt cannot be submitted.','ATTEMPT_CLOSED')
 const expired=attempt.expiresAt&&Date.now()>=attempt.expiresAt.getTime()
 const scored=await scoreAttempt(attempt,expired)
 res.json({success:true,data:{result:resultPayload(scored)}})
}
module.exports={startAttempt,getAttempt,saveAnswer,submitAttempt}
