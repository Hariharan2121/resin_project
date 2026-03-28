const { Pool } = require('pg');
require('dotenv').config();

// FORCE the use of the live URL. If it's missing, we want a clear error.
const connectionString = process.env.DB_LIVE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ CRITICAL ERROR: No database URL found in environment variables (DB_LIVE_URL or DATABASE_URL).');
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: connectionString ? { rejectUnauthorized: false } : false
});

const initDb = async () => {
  try {
    console.log('⏳ Verifying database tables...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        image_url TEXT,
        category VARCHAR(100),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS favourites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      );
    `);

    const { rows } = await pool.query('SELECT count(*) FROM products');
    if (parseInt(rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO products (name, price, image_url, category) VALUES
        ('Blue Ocean Tray', 1200, '/images/product_1.jpg', 'Trays'),
        ('Crystal Coasters', 450, '/images/product_2.jpg', 'Coasters'),
        ('Floral Pendant', 800, '/images/product_3.jpg', 'Jewelry'),
        ('Golden Clock', 2500, '/images/product_4.jpg', 'Clocks')
      `);
      console.log('🌱 Database seeded with dummy products.');
    }
    console.log('✅ PostgreSQL ready.');
  } catch (err) {
    console.error('❌ Database init failed:', err.message);
  }
};

initDb();

module.exports = pool;
