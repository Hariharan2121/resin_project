const express = require('express')
const pool = require('../db')

const router = express.Router()

/**
 * GET /api/products
 * Returns all products from the database (public endpoint).
 */
router.get('/', async (req, res) => {
  try {
    const [products] = await pool.query(
      'SELECT id, name, price, image_url, description FROM products ORDER BY id ASC'
    )
    res.json(products)
  } catch (err) {
    console.error('[Products Error]', err)
    res.status(500).json({ message: 'Failed to fetch products.' })
  }
})

module.exports = router
