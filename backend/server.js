require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 RKL Trove API running on http://localhost:${PORT}`);
    console.log(`📡 CORS allowed for: http://localhost:5173\n`);
  });
});
