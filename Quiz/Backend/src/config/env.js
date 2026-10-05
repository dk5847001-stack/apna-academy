const dotenv = require('dotenv')
const { z } = require('zod')
dotenv.config()
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5001),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  CLIENT_ORIGINS: z.string().default('http://localhost:5173'),
  QUIZ_ATTEMPT_TTL_BUFFER_SECONDS: z.coerce.number().int().min(0).max(300).default(15),
  ADMIN_EMAIL: z.string().email('ADMIN_EMAIL must be valid'),
  ADMIN_PASSWORD_HASH: z.string().min(20, 'ADMIN_PASSWORD_HASH is required'),
  ADMIN_TOKEN_SECRET: z.string().min(32, 'ADMIN_TOKEN_SECRET must be at least 32 characters'),
})
const parsed = schema.safeParse(process.env)
if (!parsed.success) {
  console.error('Invalid Quiz backend environment:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}
module.exports = {
  env: parsed.data,
  allowedOrigins: parsed.data.CLIENT_ORIGINS.split(',').map((value) => value.trim()).filter(Boolean),
}