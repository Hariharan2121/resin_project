const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true
    },
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true
    },
    password: {
      type:     String,
      required: [true, 'Password is required']
    },
    phone: {
      type:    String,
      default: null,
      trim:    true
    },
    address: {
      type:    String,
      default: null,
      trim:    true
    },
    city: {
      type:    String,
      default: null,
      trim:    true
    },
    pincode: {
      type:    String,
      default: null,
      trim:    true
    },
    role: {
      type:    String,
      enum:    ['user', 'admin'],
      default: 'user'
    }
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
