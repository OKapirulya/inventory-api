import { createClient } from 'redis'
import { logger } from '../logger'

let client: ReturnType<typeof createClient> | null = null

async function getRedis() {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL,
    })

    client.on('error', (err) => {
      logger.error({ err }, 'Unexpected Redis error')
      process.exit(1)
    })

    await client.connect()
  }

  return client
}

export const redis = {
  get: (key: string) => getRedis().then(c => c.get(key)),
  set: (key: string, value: string, ttlSeconds?: number) =>
    getRedis().then(c =>
      ttlSeconds ? c.set(key, value, { EX: ttlSeconds }) : c.set(key, value)
    ),
  incr: (key: string) => getRedis().then(c => c.incr(key)),
  expire: (key: string, ttlSeconds: number) => getRedis().then(c => c.expire(key, ttlSeconds)),
  quit: () => client?.quit(),
}