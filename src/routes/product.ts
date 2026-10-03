import { Hono } from 'hono'
import { db } from '../db/client'
import { authMiddleware } from '../middleware/jwt'
import { createProductSchema, updateProductSchema } from '../validators/product'
import { logger } from '../logger'
import { userRateLimit } from '../middleware/rateLimit'

const products = new Hono()

products.use('*', authMiddleware, userRateLimit)

products.get('/', async (c) => {
  const user = c.get('user') as { id: number }

  const result = await db.query(
    'SELECT * FROM products WHERE user_id = $1 ORDER BY created_at DESC',
    [user.id]
  )

  return c.json({ products: result.rows })
})

products.get('/:id', async (c) => {
  const user = c.get('user') as { id: number }
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return c.json({ error: 'Invalid product id' }, 400)
  }

  const result = await db.query(
    'SELECT * FROM products WHERE id = $1 AND user_id = $2',
    [id, user.id]
  )

  if (result.rows.length === 0) {
    return c.json({ error: 'Product not found' }, 404)
  }

  return c.json({ product: result.rows[0] })
})

products.post('/', async (c) => {
  const user = c.get('user') as { id: number }
  const body = await c.req.json()

  const result = createProductSchema.safeParse(body)
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? 'Invalid input'
    return c.json({ error: message }, 400)
  }

  const { name, description, price, quantity } = result.data

  const dbResult = await db.query(
    `INSERT INTO products (name, description, price, quantity, user_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, description ?? null, price, quantity, user.id]
  )

  logger.info({ userId: user.id, productId: dbResult.rows[0].id }, 'Product created')

  return c.json({ product: dbResult.rows[0] }, 201)
})

products.put('/:id', async (c) => {
  const user = c.get('user') as { id: number }
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return c.json({ error: 'Invalid product id' }, 400)
  }

  const body = await c.req.json()
  const result = updateProductSchema.safeParse(body)
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? 'Invalid input'
    return c.json({ error: message }, 400)
  }

  const existing = await db.query(
    'SELECT id FROM products WHERE id = $1 AND user_id = $2',
    [id, user.id]
  )

  if (existing.rows.length === 0) {
    return c.json({ error: 'Product not found' }, 404)
  }

  const fields = result.data
  const keys = Object.keys(fields)

  if (keys.length === 0) {
    return c.json({ error: 'No fields to update' }, 400)
  }

  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ')
  const values = [...Object.values(fields), id, user.id]

  const dbResult = await db.query(
    `UPDATE products SET ${setClause}, updated_at = NOW()
     WHERE id = $${keys.length + 1} AND user_id = $${keys.length + 2}
     RETURNING *`,
    values
  )

  logger.info({ userId: user.id, productId: id }, 'Product updated')

  return c.json({ product: dbResult.rows[0] })
})

products.delete('/:id', async (c) => {
  const user = c.get('user') as { id: number }
  const id = Number(c.req.param('id'))

  if (isNaN(id)) {
    return c.json({ error: 'Invalid product id' }, 400)
  }

  const result = await db.query(
    'DELETE FROM products WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, user.id]
  )

  if (result.rows.length === 0) {
    return c.json({ error: 'Product not found' }, 404)
  }

  logger.info({ userId: user.id, productId: id }, 'Product deleted')

  return c.json({ message: 'Product deleted' })
})

export default products