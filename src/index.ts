import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import dotenv from 'dotenv'

dotenv.config()

const app = new Hono()

app.get('/', (c) => {
  return c.json({ message: 'Inventory API is running', version: '1.0.0' })
})

const port = Number(process.env.PORT) || 3000

serve({
  fetch: app.fetch,
  port,
}, () => {
  console.log(`Server running on port ${port}`)
})

export default app