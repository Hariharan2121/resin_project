const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const listProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Product = mongoose.model('Product', new mongoose.Schema({ name: String, image_url: String }));
    const all = await Product.find({}, { name: 1, image_url: 1 });
    console.log(JSON.stringify(all, null, 2));
    process.exit(0);
  } catch (err) {
    process.exit(1);
  }
};
listProducts();
