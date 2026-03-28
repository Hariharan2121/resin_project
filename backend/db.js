const mysql = require('mysql2/promise')
require('dotenv').config()
const { Pool } = require('pg');
require('dotenv').config();

/**
 * Creates and exports a PostgreSQL connection pool.
 * Using a pool allows concurrent requests without creating a new connection
 * for every database query.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Add SSL for live Render database
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Helper to use the same query syntax as mysql2 (for minimal changes elsewhere)
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};

console.log('✅ PostgreSQL connection pool initialized.');
