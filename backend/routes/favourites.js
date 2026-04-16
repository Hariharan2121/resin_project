const express = require('express')
const router = express.Router()
const Favourite = require('../models/Favourite')
const Product = require('../models/Product')
const authMiddleware = require('../middleware/authMiddleware')

/**
 * GET /api/favourites
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const favourites = await Favourite.find({ user_id: req.user.id }).populate('product_id')

    const data = favourites
      .filter(f => f.product_id) // guard against orphaned refs
      .map(f => {
        const p = f.product_id
        return {
          id:          p._id.toString(),
          name:        p.name        || '',
          price:       parseFloat(p.price) || 0,
          image_url:   p.image_url   || '',
          description: p.description || '',
          is_available: p.is_available !== undefined ? p.is_available : true,
          createdAt:   p.createdAt
        }
      })

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
    const existing = await Favourite.findOne({ user_id: req.user.id, product_id: productId })
    if (existing) return res.json({ success: true, message: 'Already in favourites.' })

    const fav = new Favourite({ user_id: req.user.id, product_id: productId })
    await fav.save()
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
    await Favourite.findOneAndDelete({ user_id: req.user.id, product_id: productId })
    res.json({ success: true, message: 'Removed from favourites.' })
  } catch (err) {
    console.error('[Remove Favourite Error]', err)
    res.status(500).json({ message: 'Failed to remove from favourites.' })
  }
})

module.exports = router
