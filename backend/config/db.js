const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    const dbUrl = process.env.DATABASE_URL;
    const uri = mongoUri || dbUrl;
    
    if (!uri) {
      console.error('❌ Database connection string not found (MONGO_URI/DATABASE_URL missing)');
      process.exit(1);
    }
    
    const cleanUri = uri.trim().replace(/^["']|["']$/g, '');
    const maskedUri = cleanUri.replace(/\/\/.*@/, '//****:****@');
    
    console.log(`📡 Connecting to MongoDB...`);

    await mongoose.connect(cleanUri, {
      serverSelectionTimeoutMS: 15000,
    });
    
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB Connection Failure!');
    console.error('   Error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
