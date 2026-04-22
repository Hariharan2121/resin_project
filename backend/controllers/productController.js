const Product = require('../models/Product');

/**
 * GET /api/products
 * Fetch all products from the Trove with standardized formatting.
 */
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    const data = products.map(product => ({
      id:          product._id.toString(),
      name:        product.name        || '',
      collection:  product.collection  || '',
      price:       parseFloat(product.price) || 0,
      image_url:   product.image_url   || '',
      description: product.description || '',
      is_available: product.is_available !== undefined ? product.is_available : true,
      createdAt:   product.createdAt
    }));

    res.json({ success: true, data });
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
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      data: {
        id:          product._id.toString(),
        name:        product.name,
        collection:  product.collection || '',
        price:       parseFloat(product.price) || 0,
        image_url:   product.image_url   || '',
        description: product.description || '',
        is_available: product.is_available !== undefined ? product.is_available : true,
        createdAt:   product.createdAt
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
 * Seeds the database with the full artisan collection using Mongoose upserts.
 */
const seedDatabase = async (req, res) => {
  try {
    console.log('--- Remote Seeding Triggered ---');

    const products = [
      { name: 'Luxe Pot collection - Opaline Luxe 1', price: 299.00, image_url: '/images/product_1.jpg',  description: 'Artisan resin pot with beautiful gold leaf accents.', is_available: true },
      { name: 'Luxe Pot collection - Opaline Luxe 2', price: 399.00, image_url: '/images/product_1.jpg',  description: 'Artisan resin pot with beautiful gold leaf accents.', is_available: true },
      { name: 'Luxe Pot collection - Opaline Luxe 3', price: 499.00, image_url: '/images/product_1.jpg',  description: 'Artisan resin pot with beautiful gold leaf accents.', is_available: true },
      { name: 'Luxe Pot collection - Opaline Luxe 4', price: 359.00, image_url: '/images/product_1.jpg',  description: 'Artisan resin pot with beautiful gold leaf accents.', is_available: true },
      { name: 'Coastal Collection - Obsidian shore',   price: 599.00, image_url: '/images/product_11.jpg', description: 'Handcrafted resin piece inspired by the night ocean.', is_available: true },
      { name: 'Floral Frame - Rosewood Mist',          price: 699.00, image_url: '/images/product_16.jpg', description: 'Antique inspired frame with real preserved rose petals.', is_available: true },
      { name: 'Midnight Moon - Keychains',             price: 199.00, image_url: '/images/product_3.jpg',  description: 'Glowing midnight moon keychain for your keys.', is_available: true },
      { name: 'Ethereal Tray - Marble Wave',           price: 1299.00, image_url: '/images/product_14.jpg', description: 'Luxury resin tray with marble-wave effects.', is_available: true },
      { name: 'Rose Gold - Trinket Dish',              price: 450.00, image_url: '/images/product_2.jpg',  description: 'Beautiful rose gold trinket dish for jewelry.', is_available: true },
      { name: 'Oceanic Breeze - Wall Art',             price: 2499.00, image_url: '/images/product_11.jpg', description: 'Large resin wall art capturing the beauty of the sea.', is_available: true },
      { name: 'Celestial Coasters - Nebula',          price: 850.00, image_url: '/images/product_2.jpg',  description: 'Hand-painted celestial coasters with resin finish.', is_available: true },
      { name: 'Luminous Lantern - Amber Glow',        price: 1599.00, image_url: '/images/product_14.jpg', description: 'Artisan lantern that glows with amber resin light.', is_available: true },
      { name: 'Vintage Petals - Keepsake',            price: 750.00, image_url: '/images/product_16.jpg', description: 'Forever preserved vintage petals in resin.', is_available: true },
      { name: 'Aura Pendant - Emerald Green',         price: 399.00, image_url: '/images/product_7.jpg',  description: 'Hand-poured resin pendant with deep emerald aura.', is_available: true },
      { name: 'Stardust Shimmer - Jewelry Box',       price: 1899.00, image_url: '/images/product_14.jpg', description: 'Elegant jewelry box with shimmer resin coating.', is_available: true },
      { name: 'Golden Ginkgo - Bookmark',             price: 150.00, image_url: '/images/product_3.jpg',  description: 'Artistic golden ginkgo leaf bookmark in clear resin.', is_available: true }
    ];

    // Delete existing and re-insert
    await Product.deleteMany({});
    await Product.insertMany(products);

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
