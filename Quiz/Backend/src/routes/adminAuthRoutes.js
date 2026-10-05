const router = require('express').Router()
const { login, me } = require('../controllers/adminAuthController')
const { requireAdmin } = require('../utils/adminAuth')
router.post('/login', login)
router.get('/me', requireAdmin, me)
module.exports = router