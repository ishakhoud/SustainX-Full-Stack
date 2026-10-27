import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import db from './db.js'
import { askEcoBot } from './services/ecobot.js'

const app = express()
const port = process.env.PORT || 3001

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

const scrypt = promisify(scryptCallback)
const hashToken = token => createHash('sha256').update(token).digest('hex')
const publicUser = id => db.prepare('SELECT id, name, xp, co2, activities FROM users WHERE id = ?').get(id)
const createSession = userId => {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(hashToken(token), userId, expiresAt)
  return token
}
const requireAuth = (req, res, next) => {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ error: 'Please sign in' })
  const session = db.prepare('SELECT user_id FROM sessions WHERE token_hash = ? AND expires_at > ?').get(hashToken(token), new Date().toISOString())
  if (!session) return res.status(401).json({ error: 'Session expired; please sign in again' })
  req.user = publicUser(session.user_id)
  next()
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.post('/api/auth/register', async (req, res) => {
  const name = String(req.body?.username || '').trim()
  const password = String(req.body?.password || '')
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(name)) return res.status(400).json({ error: 'Username must be 3–20 letters, numbers, or underscores' })
  if (password.length < 10 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return res.status(400).json({ error: 'Password must be at least 10 characters and include upper case, lower case, and a number' })
  }

  const id = name.toLowerCase()
  const existing = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(id)
  if (existing?.password_hash) return res.status(409).json({ error: 'That username is already registered' })
  const salt = randomBytes(16)
  const derived = await scrypt(password, salt, 64)
  const passwordHash = `${salt.toString('hex')}:${Buffer.from(derived).toString('hex')}`
  if (existing) db.prepare('UPDATE users SET name = ?, password_hash = ? WHERE id = ?').run(name, passwordHash, id)
  else db.prepare('INSERT INTO users (id, name, password_hash) VALUES (?, ?, ?)').run(id, name, passwordHash)
  res.status(201).json({ token: createSession(id), user: publicUser(id) })
})

app.post('/api/auth/login', async (req, res) => {
  const name = String(req.body?.username || '').trim()
  const password = String(req.body?.password || '')
  const user = db.prepare('SELECT id, password_hash FROM users WHERE id = ?').get(name.toLowerCase())
  if (!user?.password_hash) return res.status(401).json({ error: 'Incorrect username or password' })
  const [saltHex, hashHex] = user.password_hash.split(':')
  const derived = Buffer.from(await scrypt(password, Buffer.from(saltHex, 'hex'), 64))
  const expected = Buffer.from(hashHex, 'hex')
  if (derived.length !== expected.length || !timingSafeEqual(derived, expected)) {
    return res.status(401).json({ error: 'Incorrect username or password' })
  }
  res.json({ token: createSession(user.id), user: publicUser(user.id) })
})

app.post('/api/auth/logout', requireAuth, (req, res) => {
  const token = req.get('authorization').replace(/^Bearer\s+/i, '')
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token))
  res.json({ ok: true })
})

app.get('/api/auth/me', requireAuth, (req, res) => {
  const activities = db.prepare('SELECT id, text, xp, co2, created_at AS createdAt FROM activities WHERE user_id = ? ORDER BY id DESC LIMIT 20').all(req.user.id)
  res.json({ ...req.user, activityCount: req.user.activities, activities })
})

app.post('/api/activities', requireAuth, (req, res) => {
  const userId = req.user.id
  const text = String(req.body?.text || '').trim().slice(0, 120)
  const xp = Number(req.body?.xp)
  const co2 = Number(req.body?.co2)
  if (!text || !Number.isFinite(xp) || xp < 0 || !Number.isFinite(co2) || co2 < 0) {
    return res.status(400).json({ error: 'Activity text and non-negative xp and co2 are required' })
  }
  const save = db.transaction(() => {
    const result = db.prepare('INSERT INTO activities (user_id, text, xp, co2) VALUES (?, ?, ?, ?)').run(userId, text, xp, co2)
    db.prepare('UPDATE users SET xp = xp + ?, co2 = co2 + ?, activities = activities + 1 WHERE id = ?').run(xp, co2, userId)
    return db.prepare('SELECT id, text, xp, co2, created_at AS createdAt FROM activities WHERE id = ?').get(result.lastInsertRowid)
  })

  res.status(201).json(save())
})

app.get('/api/leaderboard', (_req, res) => {
  const users = db.prepare('SELECT id, name, xp, co2, activities FROM users ORDER BY xp DESC, name ASC LIMIT 10').all()
  res.json(users)
})

app.post('/api/chat', async (req, res) => {
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : ''
  if (!message) return res.status(400).json({ error: 'A message is required' })
  if (message.length > 4000) return res.status(400).json({ error: 'A message must be 4,000 characters or fewer' })

  try {
    const result = await askEcoBot(message)
    res.json(result)
  } catch (error) {
    console.error('EcoBot request failed:', error)
    res.status(503).json({ error: 'EcoBot is unavailable. Check that Ollama is running and the configured model is installed.' })
  }
})

app.listen(port, () => console.log(`sustainX API listening on http://localhost:${port}`))
