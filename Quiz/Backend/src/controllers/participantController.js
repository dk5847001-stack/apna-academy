const { z } = require('zod')
const Participant = require('../models/Participant')
const { HttpError } = require('../utils/httpError')

const profileSchema=z.object({
 name:z.string().trim().min(2).max(120),rollNumber:z.string().trim().min(1).max(80),
 mobile:z.string().regex(/^[6-9]\d{9}$/),email:z.string().email().max(180),college:z.string().trim().min(2).max(180),
 degree:z.string().trim().min(1).max(80),branch:z.string().trim().min(1).max(120),semesterYear:z.string().trim().min(1).max(60),
 city:z.string().trim().min(1).max(100),state:z.string().trim().min(1).max(100),bio:z.string().trim().max(240).optional().default('')
})
async function upsertParticipant(req,res){
 const data=profileSchema.parse(req.body)
 const participant=await Participant.findOneAndUpdate({email:data.email.toLowerCase()},{...data,email:data.email.toLowerCase()},{new:true,upsert:true,setDefaultsOnInsert:true,runValidators:true})
 res.status(200).json({success:true,data:{participantId:participant._id.toString(),profile:participant.toObject()}})
}
module.exports={upsertParticipant}
