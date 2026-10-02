import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import dotenv from 'dotenv'
import auth from './routes/auth'
import products from './routes/product'
import { logger } from './logger'

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' })
} else if (process.env.NODE_ENV !== 'production') {
  dotenv.config()
}

const app = new Hono()

app.onError((err, c) => {
  logger.error({ err }, 'Unhandled error')
  return c.json({ error: 'Internal server error' }, 500)
})

app.get('/', (c) => {
  return c.json({ message: 'Inventory API is running', version: '1.0.0' })
})

app.route('/auth', auth)
app.route('/products', products)

const port = Number(process.env.PORT) || 3000

if (process.env.NODE_ENV !== 'test') {
  serve({
    fetch: app.fetch,
    port,
  }, () => {
    logger.info(`Server running on port ${port}`)
  })
}

export default app
