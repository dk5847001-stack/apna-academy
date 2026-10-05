const crypto = require('crypto')
const password = process.argv[2]
if (!password) {
  console.error('Usage: npm run admin:hash -- "your-strong-password"')
  process.exit(1)
}
const salt = crypto.randomBytes(16)
const derived = crypto.scryptSync(password, salt, 64)
console.log('scrypt$' + salt.toString('base64url') + '$' + derived.toString('base64url'))
