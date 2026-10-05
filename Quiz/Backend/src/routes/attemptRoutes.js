const router=require('express').Router()
const {startAttempt,getAttempt,saveAnswer,submitAttempt}=require('../controllers/attemptController')
router.post('/start',startAttempt)
router.get('/:attemptId',getAttempt)
router.patch('/:attemptId/questions/:questionId',saveAnswer)
router.post('/:attemptId/submit',submitAttempt)
module.exports=router
