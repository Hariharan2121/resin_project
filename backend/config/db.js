const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    const dbUrl = process.env.DATABASE_URL;
    const uri = mongoUri || dbUrl;
    
    console.log('--- 🛡️ V3-ANTIGRAVITY DB INITIALIZER ---');
    console.log('Available Keys:', Object.keys(process.env).filter(k => k.includes('URL') || k.includes('URI')));
    
    if (!uri) {
      console.error('❌ ERROR: No connection string found in MONGO_URI or DATABASE_URL');
      process.exit(1);
    }
    
    // Detailed check for hidden characters
    const hasSpace = uri.startsWith(' ') || uri.endsWith(' ');
    const hasQuotes = uri.startsWith('"') || uri.endsWith('"') || uri.startsWith("'") || uri.endsWith("'");
    
    if (hasSpace || hasQuotes) {
      console.error('⚠️ WARNING: Hidden spaces or quotes detected in your connection string!');
      console.error(`Original Length: ${uri.length}, Trimmed Length: ${uri.trim().length}`);
    }

    const cleanUri = uri.trim().replace(/^["']|["']$/g, '');
    const maskedUri = cleanUri.replace(/\/\/.*@/, '//****:****@');
    
    console.log(`📡 Connecting to: [${maskedUri}]`);

    await mongoose.connect(cleanUri, {
      serverSelectionTimeoutMS: 15000,
    });
    
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB Connection Failure!');
    console.error('   Code:', err.code);
    console.error('   Type:', err.name);
    console.error('   Message:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
