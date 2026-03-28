require('dotenv').config()
const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/auth')
const productsRoutes = require('./routes/products')
const orderRoutes = require('./routes/order')
const favouritesRoutes = require('./routes/favourites')

const app = express()
const PORT = process.env.PORT || 5000

// ─── Middleware ───────────────────────────────────────────────────────────────

// CORS — allow requests from any origin
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const path = require('path')
app.use(express.static(path.join(__dirname, '../public')))

// ─── Request Logger ───────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`)
  next()
})

// ─── Routes ──────────────────────────────────────────────────────────────────
// Mount auth routes at /api so that POST /api/signup and POST /api/login work.
app.use('/api', authRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/order', orderRoutes)
app.use('/api/favourites', favouritesRoutes)

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// 404 handler
app.use((_req, res) => res.status(404).json({ message: 'Route not found.' }))

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[Unhandled Error]', err)
  res.status(500).json({ message: 'Something went wrong on the server.' })
})

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  RKL Trove API running on http://localhost:${PORT}`)
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`)
})
