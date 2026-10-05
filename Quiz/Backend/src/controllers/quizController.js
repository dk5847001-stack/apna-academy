const mongoose=require('mongoose')
const Quiz=require('../models/Quiz')
const Question=require('../models/Question')
const {HttpError}=require('../utils/httpError')

function publicQuiz(q){return {id:q._id.toString(),slug:q.slug,title:q.title,description:q.description,type:q.type,degree:q.degree,branch:q.branch,subject:q.subject,difficulty:q.difficulty,durationSeconds:q.durationSeconds,marks:q.marks,negativeMarks:q.negativeMarks,maxAttempts:q.maxAttempts,passingPercentage:q.passingPercentage,shuffleQuestions:q.shuffleQuestions,shuffleOptions:q.shuffleOptions,allowReview:q.allowReview,showExplanations:q.showExplanations,tags:q.tags,resultMode:q.resultMode}}
async function listQuizzes(req,res){
 const filter={isPublished:true}
 if(req.query.subject) filter.subject=req.query.subject
 if(req.query.degree) filter.degree=req.query.degree
 const quizzes=await Quiz.find(filter).sort({createdAt:-1}).lean()
 res.json({success:true,data:{quizzes:quizzes.map(publicQuiz)}})
}
async function getQuiz(req,res){
 const quiz=await Quiz.findOne({slug:req.params.slug,isPublished:true}).lean()
 if(!quiz) throw new HttpError(404,'Quiz not found.','QUIZ_NOT_FOUND')
 const count=await Question.countDocuments({quizId:quiz._id,isActive:true})
 res.json({success:true,data:{quiz:{...publicQuiz(quiz),questionCount:count}}})
}
async function getQuestionsForAdmin(req,res){
 if(!mongoose.isValidObjectId(req.params.quizId)) throw new HttpError(400,'Invalid quiz id.','INVALID_ID')
 const questions=await Question.find({quizId:req.params.quizId,isActive:true}).sort({position:1}).lean()
 res.json({success:true,data:{questions}})
}
module.exports={listQuizzes,getQuiz,getQuestionsForAdmin}
