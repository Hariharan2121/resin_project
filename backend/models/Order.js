const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    price:    { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'User',
      default: null
    },
    userName:   { type: String, required: true },
    userEmail:  { type: String, required: true },
    items:      { type: [orderItemSchema], default: [] },
    totalPrice: { type: Number, required: true },
    orderType: {
      type:    String,
      enum:    ['standard', 'custom'],
      default: 'standard'
    },
    customDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    status: {
      type:    String,
      enum:    ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

orderSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Order', orderSchema);
