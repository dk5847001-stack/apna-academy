const router=require('express').Router()
const {listQuizzes,getQuiz}=require('../controllers/quizController')
router.get('/',listQuizzes)
router.get('/:slug',getQuiz)
module.exports=router
