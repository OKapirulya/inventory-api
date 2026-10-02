import { Pool } from 'pg'
import { logger } from '../logger'

let pool: Pool | null = null

export function getDb(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })

    pool.on('error', (err) => {
      logger.error({ err }, 'Unexpected database error')
      process.exit(1)
    })
  }

  return pool
}

export const db = {
  query: (...args: Parameters<Pool['query']>) => getDb().query(...args as [string]),
  end: () => pool?.end(),
}