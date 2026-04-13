const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Product name is required'],
      unique:   true,
      trim:     true
    },
    price: {
      type:    Number,
      default: 0,
      min:     0
    },
    image_url: {
      type:    String,
      default: null,
      trim:    true
    },
    description: {
      type:    String,
      default: null,
      trim:    true
    }
  },
  { timestamps: true }
);

productSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Product', productSchema);
