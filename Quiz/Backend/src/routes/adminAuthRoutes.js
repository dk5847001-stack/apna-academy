const router = require('express').Router()
const { login, me } = require('../controllers/adminAuthController')
const { requireAdmin } = require('../utils/adminAuth')
const { adminLoginLimiter } = require('../middleware/rateLimiters')
router.post('/login', adminLoginLimiter, login)
router.get('/me', requireAdmin, me)
module.exports = router