const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Try MONGO_URI then fallback to DATABASE_URL (common on some platforms)
    const uri = process.env.MONGO_URI || process.env.DATABASE_URL;
    
    console.log('--- 🛡️ V2-ANTIGRAVITY DB INITIALIZER ---');
    
    if (!uri) {
      console.error('❌ CRITICAL: Neither MONGO_URI nor DATABASE_URL is defined');
      console.error('Current Keys:', Object.keys(process.env).filter(k => k.includes('URL') || k.includes('URI') || k.includes('DB')));
      process.exit(1);
    }
    
    // Log a masked version of URI to verify it exists without exposing credentials
    const maskedUri = uri.replace(/\/\/.*@/, '//****:****@');
    console.log(`📡 Connecting to: [${maskedUri}]`);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // Increased timeout
    });
    
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB Connection Failure!');
    console.error('   Code:', err.code);
    console.error('   Note:', err.message);
    
    if (err.code === 'ENOTFOUND') {
      console.error('   🔴 DNS ERROR: The hostname cluster0.n8hozm7.mongodb.net could not be resolved.');
      console.error('   👉 FIX: Check if there are hidden characters (like quotes or spaces) in your Render ENV variable.');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;
