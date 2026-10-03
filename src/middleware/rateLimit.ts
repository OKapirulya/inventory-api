import { Context, Next } from 'hono'
import { redis } from '../db/redis'
import { logger } from '../logger'

interface RateLimitOptions {
  limit: number
  windowSeconds: number
  keyBy: 'ip' | 'user'
}

export function createRateLimit({ limit, windowSeconds, keyBy }: RateLimitOptions) {
  return async (c: Context, next: Next) => {
    let identifier: string | undefined

    if (keyBy === 'ip') {
      identifier = c.req.header('x-forwarded-for') ?? c.env?.remoteAddr ?? 'unknown'
    } else {
      identifier = c.get('user')?.id?.toString()
    }

    if (!identifier) {
      logger.warn('Rate limiter could not determine identifier, skipping')
      return next()
    }

    const key = `rate_limit:${keyBy}:${identifier}`

    const current = await redis.incr(key)

    // Nur beim allerersten Increment das Fenster setzen
    if (current === 1) {
      await redis.expire(key, windowSeconds)
    }

    const remaining = Math.max(0, limit - current)

    // Informative Header Standard in jeder professionellen API
    c.header('X-RateLimit-Limit', String(limit))
    c.header('X-RateLimit-Remaining', String(remaining))
    c.header('X-RateLimit-Window', String(windowSeconds))

    if (current > limit) {
      logger.warn({ identifier, keyBy, current }, 'Rate limit exceeded')
      return c.json({ error: 'Too many requests, please try again later' }, 429)
    }

    return next()
  }
}

// Zwei fertige Instanzen direkt importierbar in den Routes
export const ipRateLimit = createRateLimit({
  limit: 10,
  windowSeconds: 900, // 15 Minuten
  keyBy: 'ip',
})

export const userRateLimit = createRateLimit({
  limit: 100,
  windowSeconds: 900,
  keyBy: 'user',
})