require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const check = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const products = await Product.find({}).limit(5);
  console.log('Sample Products (Raw):');
  console.log(JSON.stringify(products, null, 2));
  await mongoose.disconnect();
};

check();
