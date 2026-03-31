const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
  host:     process.env.DB_HOST || 'localhost',
  user:     process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'new_test_project_db',
  waitForConnections: true,
  connectionLimit: 10
});

// Connection test for server start logic in app.js or server.js
db.getConnection()
  .then(() => console.log('✅ MySQL connected successfully'))
  .catch(err => console.error('❌ MySQL connection failed:', err.message));

module.exports = db;
