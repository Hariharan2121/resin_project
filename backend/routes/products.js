const express = require('express')
const router = express.Router()
const pool = require('../db')

/**
 * GET /api/products
 */
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY id ASC')
    res.json(rows)
  } catch (err) {
    console.error('[Get Products Error]', err)
    res.status(500).json({ message: 'Failed to fetch products.' })
  }
})

/**
 * GET /api/products/:id
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id])
    if (rows.length === 0) return res.status(404).json({ message: 'Product not found.' })
    res.json(rows[0])
  } catch (err) {
    console.error('[Get Product Error]', err)
    res.status(500).json({ message: 'Failed to fetch product details.' })
  }
})

module.exports = router
