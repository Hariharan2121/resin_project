const { Pool } = require('pg');
require('dotenv').config();

console.log('--- 🔍 DATABASE DEBUG INFO ---');
console.log('Available Env Keys:', Object.keys(process.env).filter(k => k.includes('DB') || k.includes('URL')));

const connectionString = process.env.DB_LIVE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ FATAL ERROR: No connection string found! Falling back to localhost.');
} else {
  console.log('🔗 Connection string found. Starts with:', connectionString.substring(0, 10));
}

const pool = new Pool({
  connectionString: connectionString,
  // Only use SSL if there is a connection string (aka production)
  ssl: connectionString ? { rejectUnauthorized: false } : false
});

const initDb = async () => {
  try {
    console.log('⏳ Verifying database tables...');
    await pool.query('SELECT NOW()');
    
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

    console.log('✅ PostgreSQL tables verified.');
  } catch (err) {
    console.error('❌ Database init failed:', err.message);
  }
};

initDb();

module.exports = pool;
