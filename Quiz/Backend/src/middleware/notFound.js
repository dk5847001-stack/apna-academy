function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Quiz API route not found.' },
  })
}

module.exports = { notFound }
