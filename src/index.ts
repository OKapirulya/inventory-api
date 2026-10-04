import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { prometheus } from '@hono/prometheus'
import dotenv from 'dotenv'
import auth from './routes/auth'
import products from './routes/product'
import { logger } from './logger'
import { redis } from './db/redis'

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' })
} else if (process.env.NODE_ENV !== 'production') {
  dotenv.config()
}

const app = new Hono()

const { printMetrics, registerMetrics } = prometheus({
  collectDefaultMetrics: true,
})

app.use('*', registerMetrics)

app.onError((err, c) => {
  logger.error({ err }, 'Unhandled error')
  return c.json({ error: 'Internal server error' }, 500)
})

app.get('/', (c) => {
  return c.json({ message: 'Inventory API is running', version: '1.0.0' })
})

app.get('/metrics', printMetrics)

app.route('/auth', auth)
app.route('/products', products)

const port = Number(process.env.PORT) || 3000

if (process.env.NODE_ENV !== 'test') {
  async function start() {
    await redis.get('ping').catch(() => { })

    serve({
      fetch: app.fetch,
      port,
    }, () => {
      logger.info(`Server running on port ${port}`)
    })

    process.on('SIGTERM', async () => {
      logger.info('Shutting down...')
      await redis.quit()
      process.exit(0)
    })
  }

  start()
}

export default app