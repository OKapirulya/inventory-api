import fs from 'fs'
import path from 'path'
import { db } from './client'

const migrationsDir = path.join(__dirname, 'migrations')

async function migrate() {
  console.log('Running migrations...')

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
      console.log(`Skipping ${file} (already executed)`)
      continue
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    await db.query(sql)
    await db.query('INSERT INTO migrations (filename) VALUES ($1)', [file])
    console.log(`Executed ${file}`)
  }

  console.log('Migrations complete')
  await db.end()
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})