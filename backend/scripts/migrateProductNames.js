require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const migrate = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const products = await Product.find({});
  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    const fullName = product.name;

    if (fullName.includes(' - ')) {
      const parts = fullName.split(' - ');
      if (parts.length === 2) {
        product.collection = parts[0].trim();
        product.name       = parts[1].trim();
      } else if (parts.length >= 3) {
        product.collection = parts[parts.length - 2].trim();
        product.name       = parts[parts.length - 1].trim();
      }
      await product.save();
      updated++;
      console.log(`✅ Updated: "${fullName}"`);
    } else if (fullName.includes(' Collection ')) {
      // Fallback for names like "Coastal Collection Ocean Whisper"
      const parts = fullName.split(' Collection ');
      product.collection = parts[0].trim() + ' Collection';
      product.name       = parts[1].trim();
      
      await product.save();
      updated++;
      console.log(`✅ Updated (via keyword): "${fullName}"`);
      console.log(`   collection: "${product.collection}"`);
      console.log(`   name:       "${product.name}"`);
    } else {
      // No separator — leave name as-is, collection stays empty
      skipped++;
      console.log(`⏭  Skipped (no separator): "${fullName}"`);
    }
  }

  console.log('\n──────────────────────────────');
  console.log('Migration complete.');
  console.log(`Updated: ${updated} products`);
  console.log(`Skipped: ${skipped} products`);
  console.log('──────────────────────────────');
  await mongoose.disconnect();
};

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
