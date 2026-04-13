const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema(
  {
    email: {
      type:      String,
      required:  true,
      lowercase: true,
      trim:      true
    },
    otp: {
      type:     String,
      required: true
    },
    expires_at: {
      type:     Date,
      required: true
    },
    used: {
      type:    Boolean,
      default: false
    }
  },
  { timestamps: true }
);

passwordResetSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('PasswordReset', passwordResetSchema);
