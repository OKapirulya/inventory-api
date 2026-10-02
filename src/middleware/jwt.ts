import { Context, Next } from 'hono'
import jwt, { JwtPayload } from 'jsonwebtoken'

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload & { id: number; email: string }
    c.set('user', { id: payload.id, email: payload.email })
    await next()
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
}