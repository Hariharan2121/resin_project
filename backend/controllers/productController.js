const db = require('../config/db')

/**
 * GET /api/products
 * Fetch all products from the Trove with standardized formatting.
 */
const getProducts = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, price, image_url, description, created_at FROM products ORDER BY created_at DESC'
    );
    
    // Log current data for tracing (remove after fix)
    console.log('Products from DB (first item):', rows.length > 0 ? JSON.stringify(rows[0], null, 2) : 'No products found');

    const products = rows.map(product => ({
      id:          product.id,
      name:        product.name        || '',
      price:       parseFloat(product.price) || 0,
      image_url:   product.image_url   || '',
      description: product.description || '',
      created_at:  product.created_at
    }));

    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

/**
 * GET /api/products/:id
 */
const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT id, name, price, image_url, description, created_at FROM products WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = rows[0];
    res.json({
      success: true,
      data: {
        ...product,
        price: parseFloat(product.price) || 0,
        description: product.description || ''
      }
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product details' });
  }
};

module.exports = {
  getProducts,
  getProductById
};
