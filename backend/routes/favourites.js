const express = require('express')
const router = express.Router()
const db = require('../config/db')
const authMiddleware = require('../middleware/authMiddleware')

/**
 * GET /api/favourites
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.name, p.price, p.image_url, p.description, p.created_at FROM products p
       JOIN favourites f ON p.id = f.product_id
       WHERE f.user_id = ?`,
      [req.user.id]
    )
    
    // Formatting price and description for frontend consistency
    const data = rows.map(p => ({
      ...p,
      price: parseFloat(p.price) || 0,
      description: p.description || ''
    }));

    res.json({ success: true, data })
  } catch (err) {
    console.error('[Get Favourites Error]', err)
    res.status(500).json({ message: 'Failed to fetch favourites.' })
  }
})

/**
 * POST /api/favourites
 */
router.post('/', authMiddleware, async (req, res) => {
  const productId = req.body.productId
  if (!productId) return res.status(400).json({ message: 'Product ID required.' })
  try {
    // MySQL equivalent of ON CONFLICT DO NOTHING is INSERT IGNORE
    await db.query(
      'INSERT IGNORE INTO favourites (user_id, product_id) VALUES (?, ?)',
      [req.user.id, productId]
    )
    res.json({ success: true, message: 'Updated favourites.' })
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
    await db.query(
      'DELETE FROM favourites WHERE user_id = ? AND product_id = ?',
      [req.user.id, productId]
    )
    res.json({ success: true, message: 'Removed from favourites.' })
  } catch (err) {
    console.error('[Remove Favourite Error]', err)
    res.status(500).json({ message: 'Failed to remove from favourites.' })
  }
})

module.exports = router
