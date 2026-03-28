const express = require('express')
const pool = require('../db')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

// All routes here require a valid JWT
router.use(authMiddleware)

/**
 * GET /api/favourites
 * Returns all favourite products for the authenticated user.
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id
    const [rows] = await pool.query(
      `SELECT p.*
       FROM favourites f
       JOIN products p ON p.id = f.product_id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [userId]
    )
    res.json({ success: true, data: rows })
  } catch (err) {
    console.error('[Get Favourites Error]', err)
    res.status(500).json({ success: false, message: 'Failed to fetch favourites.' })
  }
})

/**
 * POST /api/favourites
 * Body: { productId }
 * Adds a product to the user's favourites (idempotent via INSERT IGNORE).
 */
router.post('/', async (req, res) => {
  const { productId } = req.body
  if (!productId) {
    return res.status(400).json({ success: false, message: 'productId is required.' })
  }
  try {
    const userId = req.user.id
    await pool.query(
      'INSERT IGNORE INTO favourites (user_id, product_id) VALUES (?, ?)',
      [userId, productId]
    )
    res.json({ success: true, message: 'Added to favourites.' })
  } catch (err) {
    console.error('[Add Favourite Error]', err)
    res.status(500).json({ success: false, message: 'Failed to add favourite.' })
  }
})

/**
 * DELETE /api/favourites/:productId
 * Removes a product from the user's favourites.
 */
router.delete('/:productId', async (req, res) => {
  const { productId } = req.params
  try {
    const userId = req.user.id
    await pool.query(
      'DELETE FROM favourites WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    )
    res.json({ success: true, message: 'Removed from favourites.' })
  } catch (err) {
    console.error('[Remove Favourite Error]', err)
    res.status(500).json({ success: false, message: 'Failed to remove favourite.' })
  }
})

module.exports = router
