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

// Top level debug route
app.get('/api/top-health', (req, res) => res.json({ status: 'top-ok' }));

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

// Profile Routing - Registered directly and redundantly
const profileController = require('./controllers/profileController');
const authMiddleware = require('./middleware/authMiddleware');

// No-auth debug endpoint
app.get('/api/debug-profile', (req, res) => res.json({ status: 'debug-ok', help: 'If you see this, routing works' }));

// Actual profile routes
app.get('/api/profile', authMiddleware, profileController.getProfile);
app.get('/api/profile/', authMiddleware, profileController.getProfile);
app.put('/api/profile', authMiddleware, profileController.updateProfile);
app.put('/api/profile/', authMiddleware, profileController.updateProfile);

// --- Route Registrations ---
app.use('/api', authRoutes); 
app.use('/api/products', productRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/favourites', favouritesRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok-v-final-debug', timestamp: new Date().toISOString() }));

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
