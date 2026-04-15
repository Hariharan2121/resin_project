const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const fixAllImages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Product = mongoose.model('Product', new mongoose.Schema({ name: String, image_url: String }));
    
    // Set a working image path for ALL products as a test
    const result = await Product.updateMany(
      {}, 
      { $set: { image_url: '/images/product_2.jpg' } } 
    );

    console.log(`✅ Success! Updated ${result.modifiedCount} products to use /images/product_2.jpg`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
fixAllImages();
