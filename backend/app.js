const express = require('express');
const cors = require('cors');
const path = require('path');

// --- Import all routes ---
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/order');
const favouritesRoutes = require('./routes/favourites');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

// --- Step 7: CORS setup ---
// Allowing any origin during development, or specific if required
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static images (from /public)
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Request logging for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- Route Registrations ---
app.use('/api', authRoutes); // Auth uses /api/signup, /api/login, etc.
app.use('/api/products', productRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/favourites', favouritesRoutes);

// Robust Profile Routing
app.use('/api/profile', profileRoutes);
app.use('/api/profile/', profileRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Database check (legacy endpoint)
app.get('/api/test-db', async (req, res) => {
  const db = require('./config/db');
  try {
    const [result] = await db.query('SELECT NOW()');
    res.json({ success: true, time: result[0], message: 'MySQL connected!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({ message: 'Internal server error.' });
});

module.exports = app;
