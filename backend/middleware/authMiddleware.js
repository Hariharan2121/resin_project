const jwt = require('jsonwebtoken')
const db = require('../config/db') // Use MySQL config

/**
 * Express middleware that verifies the JWT sent in the
 * Authorization header (Bearer <token>).
 */
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided.' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Check if user exists in MySQL
    const [rows] = await db.query('SELECT id FROM users WHERE id = ?', [decoded.id]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Unauthorized: User no longer exists.' });
    }

    req.user = decoded 
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token.' })
  }
}

module.exports = authMiddleware
