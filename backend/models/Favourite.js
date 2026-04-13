const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema(
  {
    user_id: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true
    },
    product_id: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Product',
      required: true
    }
  },
  { timestamps: true }
);

favouriteSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

favouriteSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Favourite', favouriteSchema);
