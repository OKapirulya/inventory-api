import { Pool, QueryResult, QueryResultRow } from 'pg'
import { logger } from '../logger'

let pool: Pool | null = null

function getDb(): Pool {
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
  query: <T extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: unknown[]
  ): Promise<QueryResult<T>> => getDb().query<T>(text, values),
  end: () => pool?.end(),
}