const { ZodError } = require('zod')

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error)

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Request validation failed.', details: error.flatten() },
    })
  }

  const status = error.statusCode || 500
  if (status >= 500) console.error(error)

  return res.status(status).json({
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: status >= 500 ? 'Something went wrong on the Quiz server.' : error.message,
      ...(error.details ? { details: error.details } : {}),
    },
  })
}

module.exports = { errorHandler }
