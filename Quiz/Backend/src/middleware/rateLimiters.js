const rateLimit=require('express-rate-limit')
const generalLimiter=rateLimit({windowMs:15*60*1000,max:300,standardHeaders:'draft-7',legacyHeaders:false})
const attemptLimiter=rateLimit({windowMs:60*1000,max:120,standardHeaders:'draft-7',legacyHeaders:false})
const adminLoginLimiter=rateLimit({windowMs:15*60*1000,max:10,standardHeaders:'draft-7',legacyHeaders:false})
module.exports={generalLimiter,attemptLimiter,adminLoginLimiter}