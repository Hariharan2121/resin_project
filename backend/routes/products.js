const express = require('express')
const router = express.Router()
const pool = require('../db')

/**
 * GET /api/products
 * Self-healing route that seeds YOUR 16 REAL PRODUCTS if missing.
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
    
    // If no products, seed your real 16 products
    if (result.rows.length === 0) {
      console.log('🌱 Seeding your 16 real products...');
      await pool.query(`
        INSERT INTO products (name, price, image_url, description) VALUES
        ('Coastal Collection - ocean whisper', 249.00, '/images/product_2.jpg', 'Handcrafted resin art - product is so gooood'),
        ('Coastal Collection - Obsidian shore', 249.00, '/images/product_3.jpg', 'Handcrafted resin art - product is so gooood'),
        ('Coastal Collection - velvet Tide', 249.00, '/images/product_4.jpg', 'Handcrafted resin art - product is so gooood'),
        ('Forever Collection - forever bloom', 899.00, '/images/product_5.jpg', 'Handcrafted resin art - product is so gooood'),
        ('Forever Collection - evergreen Promise', 1299.00, '/images/product_6.jpg', 'Handcrafted resin art - product is so gooood'),
        ('Charm Collection - Petal drop silver', 349.00, '/images/product_7.jpg', 'Handcrafted resin art - product is so gooood'),
        ('Charm Collection - Petal drop Gold', 349.00, '/images/product_8.jpg', 'Handcrafted resin art - product is so gooood'),
        ('Charm Collection - Evil eye Pendant Gold', 374.00, '/images/product_9.jpg', 'Handcrafted resin art - product is so gooood'),
        ('Initial Collection - Duo initials', 349.00, '/images/product_10.jpg', 'Handcrafted resin art - product is so gooood'),
        ('Chrono Collection - Aqua chrona', 599.00, '/images/product_11.jpg', 'Handcrafted resin art - product is so gooood'),
        ('Forever Collection - crystal bloom', 2499.00, '/images/product_12.jpg', 'Handcrafted resin art - product is so gooood'),
        ('Chrono Collection - obsidian hour', 1199.00, '/images/product_13.jpg', 'Handcrafted resin art - product is so gooood'),
        ('Luxe Pot collection - Opaline Luxe 1', 299.00, '/images/product_14.jpg', 'Handcrafted resin art - product is so gooood'),
        ('Luxe Pot collection - Opaline Luxe 2', 399.00, '/images/product_15.jpg', 'Handcrafted resin art - product is so gooood'),
        ('Luxe Pot collection - Opaline Luxe 3', 499.00, '/images/product_16.jpg', 'Handcrafted resin art - product is so gooood'),
        ('Luxe Pot collection - Opaline Luxe 4', 359.00, '/images/product_1.jpg', 'Handcrafted resin art - product is so gooood')
        ON CONFLICT DO NOTHING;
      `);
      const retryResult = await pool.query('SELECT * FROM products ORDER BY id ASC');
      return res.json(retryResult.rows);
    }

    res.json(result.rows);
  } catch (err) {
    console.error('❌ PRODUCTS ROUTE ERROR:', err.message);
    res.status(500).json({ message: 'Failed to fetch products.' });
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
    res.status(500).json({ message: 'Failed to fetch product details.' })
  }
})

module.exports = router
