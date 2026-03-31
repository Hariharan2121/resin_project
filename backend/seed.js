const db = require('./config/db');

async function seed() {
  try {
    console.log('--- Database Seed Starting ---');

    console.log('1. Disabling foreign key checks...');
    await db.query('SET FOREIGN_KEY_CHECKS = 0');

    console.log('2. Dropping existing products table...');
    await db.query('DROP TABLE IF EXISTS products');

    console.log('3. Creating products table with strict types...');
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

    console.log('4. Re-enabling foreign key checks...');
    await db.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('5. Inserting FULL product collection (16 Products)...');
    const products = [
      ['Luxe Pot collection - Opaline Luxe 1', 299.00, '/images/product_1.jpg', 'Artisan resin pot with beautiful gold leaf accents.'],
      ['Luxe Pot collection - Opaline Luxe 2', 399.00, '/images/product_2.jpg', 'Artisan resin pot with beautiful gold leaf accents.'],
      ['Luxe Pot collection - Opaline Luxe 3', 499.00, '/images/product_3.jpg', 'Artisan resin pot with beautiful gold leaf accents.'],
      ['Luxe Pot collection - Opaline Luxe 4', 359.00, '/images/product_4.jpg', 'Artisan resin pot with beautiful gold leaf accents.'],
      ['Coastal Collection - Obsidian shore', 599.00, '/images/product_5.jpg', 'Handcrafted resin piece inspired by the night ocean.'],
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
      console.log(`+ Added: ${name}`);
    }

    console.log('--- Database Seed Complete! (16 Items Restored) ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ SEED FAILED:', error.message);
    process.exit(1);
  }
}

seed();
