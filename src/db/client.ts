import { Pool } from 'pg'
import { logger } from '../logger'

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
})

db.on('error', (err) => {
  logger.error({ err }, 'Unexpected database error')
  process.exit(1)
})