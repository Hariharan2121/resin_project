const express = require('express')
const router = express.Router()
const pool = require('../db')
const authMiddleware = require('../middleware/authMiddleware')

/**
 * GET /api/favourites
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.* FROM products p
       JOIN favourites f ON p.id = f.product_id
       WHERE f.user_id = $1`,
      [req.user.id]
    )
    res.json(rows)
  } catch (err) {
    console.error('[Get Favourites Error]', err)
    res.status(500).json({ message: 'Failed to fetch favourites.' })
  }
})

/**
 * POST /api/favourites/:productId
 */
router.post('/:productId?', authMiddleware, async (req, res) => {
  const productId = req.params.productId || req.body.productId
  if (!productId) return res.status(400).json({ message: 'Product ID required.' })
  try {
    await pool.query(
      'INSERT INTO favourites (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, productId]
    )
    res.json({ message: 'Added to favourites.' })
  } catch (err) {
    console.error('[Add Favourite Error]', err)
    res.status(500).json({ message: 'Failed to add to favourites.' })
  }
})

/**
 * DELETE /api/favourites/:productId
 */
router.delete('/:productId', authMiddleware, async (req, res) => {
  const { productId } = req.params
  try {
    await pool.query(
      'DELETE FROM favourites WHERE user_id = $1 AND product_id = $2',
      [req.user.id, productId]
    )
    res.json({ message: 'Removed from favourites.' })
  } catch (err) {
    console.error('[Remove Favourite Error]', err)
    res.status(500).json({ message: 'Failed to remove from favourites.' })
  }
})

module.exports = router
