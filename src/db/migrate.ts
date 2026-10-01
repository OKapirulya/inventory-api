import fs from 'fs'
import path from 'path'
import { db } from './client'
import { logger } from '../logger'

const migrationsDir = path.join(__dirname, 'migrations')

async function migrate() {
  logger.info('Running migrations...')

  await db.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT NOW()
    )
  `)

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  for (const file of files) {
    const { rows } = await db.query(
      'SELECT id FROM migrations WHERE filename = $1',
      [file]
    )

    if (rows.length > 0) {
      logger.debug({ file }, 'Skipping migration (already executed)')
      continue
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    await db.query(sql)
    await db.query('INSERT INTO migrations (filename) VALUES ($1)', [file])
    logger.info({ file }, 'Migration executed')
  }

  logger.info('Migrations complete')
  await db.end()
}

migrate().catch((err) => {
  logger.error({ err }, 'Migration failed')
  process.exit(1)
})