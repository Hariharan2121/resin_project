const db = require('../config/db');

/**
 * GET /api/products
 * Fetch all products from the Trove with standardized formatting.
 */
const getProducts = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, price, image_url, description, created_at FROM products ORDER BY created_at DESC'
    );
    
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

/**
 * --- ADMIN ACTION ---
 * GET /api/products/admin/seed
 * This seeds the database with the full artisan collection.
 * Required for remote deployment (Render) where direct shell access is limited.
 */
const seedDatabase = async (req, res) => {
  try {
    console.log('--- Remote Seeding Triggered ---');
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.query('DROP TABLE IF EXISTS products');
    await db.query(`
      CREATE TABLE products (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(150)   NOT NULL,
        price       DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
        image_url   TEXT,
        description TEXT,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.query('SET FOREIGN_KEY_CHECKS = 1');

    const products = [
      ['Luxe Pot collection - Opaline Luxe 1', 299.00, '/images/product_1.jpg', 'Artisan resin pot with beautiful gold leaf accents.'],
      ['Luxe Pot collection - Opaline Luxe 2', 399.00, '/images/product_1.jpg', 'Artisan resin pot with beautiful gold leaf accents.'],
      ['Luxe Pot collection - Opaline Luxe 3', 499.00, '/images/product_1.jpg', 'Artisan resin pot with beautiful gold leaf accents.'],
      ['Luxe Pot collection - Opaline Luxe 4', 359.00, '/images/product_1.jpg', 'Artisan resin pot with beautiful gold leaf accents.'],
      ['Coastal Collection - Obsidian shore', 599.00, '/images/product_11.jpg', 'Handcrafted resin piece inspired by the night ocean.'],
      ['Floral Frame - Rosewood Mist', 699.00, '/images/product_16.jpg', 'Antique inspired frame with real preserved rose petals.'],
      ['Midnight Moon - Keychains', 199.00, '/images/product_3.jpg', 'Glowing midnight moon keychain for your keys.'],
      ['Ethereal Tray - Marble Wave', 1299.00, '/images/product_14.jpg', 'Luxury resin tray with marble-wave effects.'],
      ['Rose Gold - Trinket Dish', 450.00, '/images/product_2.jpg', 'Beautiful rose gold trinket dish for jewelry.'],
      ['Oceanic Breeze - Wall Art', 2499.00, '/images/product_11.jpg', 'Large resin wall art capturing the beauty of the sea.'],
      ['Celestial Coasters - Nebula', 850.00, '/images/product_2.jpg', 'Hand-painted celestial coasters with resin finish.'],
      ['Luminous Lantern - Amber Glow', 1599.00, '/images/product_14.jpg', 'Artisan lantern that glows with amber resin light.'],
      ['Vintage Petals - Keepsake', 750.00, '/images/product_16.jpg', 'Forever preserved vintage petals in resin.'],
      ['Aura Pendant - Emerald Green', 399.00, '/images/product_7.jpg', 'Hand-poured resin pendant with deep emerald aura.'],
      ['Stardust Shimmer - Jewelry Box', 1899.00, '/images/product_14.jpg', 'Elegant jewelry box with shimmer resin coating.'],
      ['Golden Ginkgo - Bookmark', 150.00, '/images/product_3.jpg', 'Artistic golden ginkgo leaf bookmark in clear resin.']
    ];

    for (const [name, price, img, desc] of products) {
      await db.query(
        'INSERT INTO products (name, price, image_url, description) VALUES (?, ?, ?, ?)',
        [name, price, img, desc]
      );
    }

    res.json({ success: true, message: 'Database reset and 16 products seeded successfully on remote.' });
  } catch (error) {
    console.error('Remote Seed Fail:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  seedDatabase
};
