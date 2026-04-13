const express = require('express');
const cors = require('cors');
const path = require('path');

// --- Import all routes ---
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/order');
const favouritesRoutes = require('./routes/favourites');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Top level debug route
app.get('/api/top-health', (req, res) => res.json({ status: 'top-ok' }));

// --- CORS setup ---
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

// Profile Routing — registered directly for reliability
const profileController = require('./controllers/profileController');
const authMiddleware = require('./middleware/authMiddleware');

// No-auth debug endpoint
app.get('/api/debug-profile', (req, res) => res.json({ status: 'debug-ok', help: 'If you see this, routing works' }));

// Actual profile routes
app.get('/api/profile',  authMiddleware, profileController.getProfile);
app.get('/api/profile/', authMiddleware, profileController.getProfile);
app.put('/api/profile',  authMiddleware, profileController.updateProfile);
app.put('/api/profile/', authMiddleware, profileController.updateProfile);
app.delete('/api/profile', authMiddleware, profileController.deleteAccount);

// --- Route Registrations ---
app.use('/api/bulk-upload', uploadRoutes);
app.use('/api', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/favourites', favouritesRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', db: 'mongodb', timestamp: new Date().toISOString() }));

// MongoDB connection check
app.get('/api/test-db', async (req, res) => {
  const mongoose = require('mongoose');
  const state = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({ success: state === 1, db: 'mongodb', state: stateMap[state] || state });
});

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({ message: 'Internal server error.' });
});

module.exports = app;
