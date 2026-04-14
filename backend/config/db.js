const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error('❌ MONGO_URI is not defined in environment variables');
      process.exit(1);
    }
    
    // Log a masked version of URI to verify it exists without exposing credentials
    const maskedUri = uri.replace(/\/\/.*@/, '//****:****@');
    console.log(`📡 Attempting to connect to MongoDB: ${maskedUri}`);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
    });
    
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection failed!');
    console.error('   Error Code:', err.code);
    console.error('   Error Message:', err.message);
    
    if (err.message.includes('IP address') || err.message.includes('whitelist')) {
      console.error('   👉 ACTION REQUIRED: Your current IP might not be whitelisted in MongoDB Atlas.');
      console.error('   👉 Go to MongoDB Atlas > Network Access > Add 0.0.0.0/0 to allow access from all IPs.');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;
