const crypto = require('crypto')
const { env } = require('../config/env')
const { HttpError } = require('./httpError')

function base64url(buffer) {
  return buffer.toString('base64url')
}

function hashPassword(password, salt = crypto.randomBytes(16)) {
  const derived = crypto.scryptSync(password, salt, 64)
  return 'scrypt$' + base64url(salt) + '$' + base64url(derived)
}

function verifyPassword(password, encoded) {
  const parts = String(encoded || '').split('$')
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false
  try {
    const salt = Buffer.from(parts[1], 'base64url')
    const expected = Buffer.from(parts[2], 'base64url')
    const actual = crypto.scryptSync(password, salt, expected.length)
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
  } catch {
    return false
  }
}

function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto.createHmac('sha256', env.ADMIN_TOKEN_SECRET).update(body).digest('base64url')
  return body + '.' + signature
}

function verifyToken(token) {
  const [body, signature] = String(token || '').split('.')
  if (!body || !signature) throw new HttpError(401, 'Admin authentication is required.', 'ADMIN_AUTH_REQUIRED')
  const expected = crypto.createHmac('sha256', env.ADMIN_TOKEN_SECRET).update(body).digest('base64url')
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new HttpError(401, 'Invalid admin session.', 'ADMIN_SESSION_INVALID')
  }
  let payload
  try { payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) } catch {
    throw new HttpError(401, 'Invalid admin session.', 'ADMIN_SESSION_INVALID')
  }
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new HttpError(401, 'Admin session has expired.', 'ADMIN_SESSION_EXPIRED')
  }
  return payload
}

function requireAdmin(req, res, next) {
  try {
    const header = req.get('authorization') || ''
    if (!header.startsWith('Bearer ')) throw new HttpError(401, 'Admin authentication is required.', 'ADMIN_AUTH_REQUIRED')
    const payload = verifyToken(header.slice(7))
    if (payload.role !== 'admin') throw new HttpError(403, 'Admin permission required.', 'ADMIN_FORBIDDEN')
    req.admin = payload
    next()
  } catch (error) { next(error) }
}

module.exports = { hashPassword, verifyPassword, signToken, verifyToken, requireAdmin }