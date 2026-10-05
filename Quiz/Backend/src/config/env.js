const dotenv = require('dotenv')
const { z } = require('zod')

dotenv.config()

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5001),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  CLIENT_ORIGINS: z.string().default('http://localhost:5173'),
  QUIZ_ATTEMPT_TTL_BUFFER_SECONDS: z.coerce.number().int().min(0).max(300).default(15),
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
