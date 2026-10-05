const router = require('express').Router()
const { getResult, listResults } = require('../controllers/resultController')

router.get('/', listResults)
router.get('/:attemptId', getResult)

module.exports = router
