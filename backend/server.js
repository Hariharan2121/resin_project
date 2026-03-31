require('dotenv').config();
const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 5000;

/**
 * --- Step 7: Database Connection Test ---
 * This ensures the server only starts successfully if MySQL is reachable.
 */
db.getConnection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🚀 RKL Trove API running on http://localhost:${PORT}`);
      console.log(`📡 CORS allowed for: http://localhost:5173\n`);
    });
  })
  .catch(err => {
    console.error('❌ Critical Error: Could not connect to MySQL Database.');
    console.error(err.message);
    process.exit(1);
  });
