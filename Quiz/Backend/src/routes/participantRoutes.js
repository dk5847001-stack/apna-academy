const router=require('express').Router()
const {upsertParticipant}=require('../controllers/participantController')
router.post('/',upsertParticipant)
module.exports=router
