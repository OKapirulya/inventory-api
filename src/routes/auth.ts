import { Hono } from 'hono'
import bcrypt from 'bcrypt'
import jwt, { SignOptions } from 'jsonwebtoken'
import { db } from '../db/client'
import { UserResponse } from '../models/user'
import { registerSchema, loginSchema } from '../validators/auth'
import { logger } from '../logger'
import { ipRateLimit } from '../middleware/rateLimit'

const auth = new Hono()

auth.post('/register', ipRateLimit, async (c) => {
  const body = await c.req.json()

  const result = registerSchema.safeParse(body)
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? 'Invalid input'
    return c.json({ error: message }, 400)
  }

  const { email, password } = result.data

  const existing = await db.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  )

  if (existing.rows.length > 0) {
    return c.json({ error: 'Email already in use' }, 409)
  }

  const password_hash = await bcrypt.hash(password, 12)

  const dbResult = await db.query<UserResponse>(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
    [email, password_hash]
  )

  const user = dbResult.rows[0]
  logger.info({ userId: user.id }, 'User registered')

  return c.json({ user }, 201)
})

auth.post('/login', ipRateLimit, async (c) => {
  const body = await c.req.json()

  const result = loginSchema.safeParse(body)
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? 'Invalid input'
    return c.json({ error: message }, 400)
  }

  const { email, password } = result.data

  const dbResult = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  )

  if (dbResult.rows.length === 0) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const user = dbResult.rows[0]
  const valid = await bcrypt.compare(password, user.password_hash)

  if (!valid) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'],
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET as string,
    options
  )

  logger.info({ userId: user.id }, 'User logged in')

  return c.json({ token })
})

export default auth