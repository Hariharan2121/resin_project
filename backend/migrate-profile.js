/**
 * Database Migration Script
 * This script adds 'phone', 'address', and 'pincode' columns to the 'users' table.
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  console.log('🚀 Starting migration for profile columns...');
  
  // Use DATABASE_URL if available, otherwise use individual DB_ environment variables
  const connectionConfig = process.env.DATABASE_URL || {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  };

  let connection;
  try {
    connection = await mysql.createConnection(connectionConfig);
    console.log('✅ Connected to database.');

    const queries = [
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS pincode VARCHAR(10)'
    ];

    for (const query of queries) {
      console.log(`⏳ Running: ${query}...`);
      await connection.query(query);
    }

    console.log('✨ Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.log('\nTip: If you are connecting to Render, make sure you have the correct DATABASE_URL in your .env file.');
  } finally {
    if (connection) await connection.end();
  }
}

migrate();
