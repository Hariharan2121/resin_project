const jwt = require('jsonwebtoken')
const User = require('../models/User')

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

    // Check if user still exists in MongoDB
    const user = await User.findById(decoded.id).select('_id')
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User no longer exists.' })
    }

    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token.' })
  }
}

module.exports = authMiddleware
