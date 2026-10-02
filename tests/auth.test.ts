import { describe, it, expect, beforeEach } from 'vitest'
import app from '../src/index'
import { db } from '../src/db/client'

beforeEach(async () => {
  await db.query('DELETE FROM products')
  await db.query('DELETE FROM users')
})

describe('Auth endpoints', () => {
  describe('POST /auth/register', () => {
    it('should return 400 for invalid email', async () => {
      const res = await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'notanemail', password: 'password123' }),
      })

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBe('Invalid email format')
    })

    it('should return 400 for short password', async () => {
      const res = await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: '123' }),
      })

      expect(res.status).toBe(400)
      const body = await res.json()
      expect(body.error).toBe('Password must be at least 8 characters')
    })

    it('should register a new user successfully', async () => {
      const res = await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'new@test.com', password: 'password123' }),
      })

      expect(res.status).toBe(201)
      const body = await res.json()
      expect(body.user.email).toBe('new@test.com')
      expect(body.user.password_hash).toBeUndefined()
    })

    it('should return 409 for duplicate email', async () => {
      await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'dup@test.com', password: 'password123' }),
      })

      const res = await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'dup@test.com', password: 'password123' }),
      })

      expect(res.status).toBe(409)
    })
  })

  describe('POST /auth/login', () => {
    it('should return 400 for missing fields', async () => {
      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com' }),
      })

      expect(res.status).toBe(400)
    })

    it('should return 401 for wrong password', async () => {
      await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'login@test.com', password: 'password123' }),
      })

      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'login@test.com', password: 'wrongpassword' }),
      })

      expect(res.status).toBe(401)
    })

    it('should return token on successful login', async () => {
      await app.request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'login@test.com', password: 'password123' }),
      })

      const res = await app.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'login@test.com', password: 'password123' }),
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.token).toBeDefined()
    })
  })

  describe('GET /products', () => {
    it('should return 401 without token', async () => {
      const res = await app.request('/products')
      expect(res.status).toBe(401)
    })
  })
})