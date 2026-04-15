const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const MONGO_URI = process.env.MONGO_URI;

const fixImages = async () => {
  try {
    console.log('📡 Connecting to MongoDB to fix images...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected.');

    const Product = mongoose.model('Product', new mongoose.Schema({
      name: String,
      image_url: String
    }));

    // Update the specific product mentioned by the user
    // We'll look for products with 'Keychain' or 'Coastal' as shown in their screenshot
    const result = await Product.updateMany(
      { name: /Coastal Collection - Ocean Whisper/i },
      { $set: { image_url: '/images/product_2.jpg' } }
    );

    console.log(`✨ Database Updated! Matches found and updated: ${result.modifiedCount}`);
    
    // Also fix any products that have empty image_url to at least have a fallback or stay null 
    // instead of triggering ORB errors
    const empties = await Product.updateMany(
      { image_url: '' },
      { $set: { image_url: null } }
    );
    console.log(`🧹 Cleaned up ${empties.modifiedCount} empty strings to null.`);

    process.exit(0);
  } catch (err) {
    console.error('❌ database update failed:', err);
    process.exit(1);
  }
};

fixImages();
