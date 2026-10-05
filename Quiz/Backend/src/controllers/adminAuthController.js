const { z } = require('zod')
const { env } = require('../config/env')
const { verifyPassword, signToken } = require('../utils/adminAuth')
const { HttpError } = require('../utils/httpError')

const loginSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(200),
})

async function login(req, res) {
  const { email, password } = loginSchema.parse(req.body)
  if (email !== env.ADMIN_EMAIL.toLowerCase() || !verifyPassword(password, env.ADMIN_PASSWORD_HASH)) {
    throw new HttpError(401, 'Invalid admin email or password.', 'ADMIN_LOGIN_FAILED')
  }
  const now = Math.floor(Date.now() / 1000)
  const token = signToken({ sub: email, role: 'admin', iat: now, exp: now + 8 * 60 * 60 })
  res.json({ success: true, data: { token, expiresAt: new Date((now + 8 * 60 * 60) * 1000).toISOString(), admin: { email, role: 'admin' } } })
}

async function me(req, res) {
  res.json({ success: true, data: { admin: { email: req.admin.sub, role: req.admin.role, expiresAt: new Date(req.admin.exp * 1000).toISOString() } } })
}

module.exports = { login, me }