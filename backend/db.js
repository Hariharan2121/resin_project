const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

const initDb = async () => {
  try {
    // Create Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Products table
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

    // Create Password Resets table
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

    // Create Favourites table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favourites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      );
    `);

    // Seed dummy products if empty
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

    console.log('✅ PostgreSQL tables verified/created.');
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
  }
};

initDb();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
