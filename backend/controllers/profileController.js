const User = require('../models/User');
const Favourite = require('../models/Favourite');
const PasswordReset = require('../models/PasswordReset');

/**
 * GET /api/profile
 */
exports.getProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId)
      .select('name email phone address pincode createdAt');
      
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id:        user._id,
        name:      user.name      || '',
        email:     user.email     || '',
        phone:     user.phone     || '',
        address:   user.address   || '',
        pincode:   user.pincode   || '',
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('[Profile Fetch Error]', err.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
};

/**
 * PUT /api/profile
 */
exports.updateProfile = async (req, res) => {
  const { name, phone, address, pincode } = req.body;
  const userId = req.user.id;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Full name must be at least 2 characters'
    });
  }

  if (!phone || phone.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Phone number is required'
    });
  }

  if (!/^[0-9]{10}$/.test(phone.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Enter a valid 10-digit phone number'
    });
  }

  if (pincode && !/^[0-9]{6}$/.test(pincode.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Enter a valid 6-digit pincode'
    });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name:    name.trim(),
        phone:   phone.trim(),
        address: address ? address.trim() : '',
        pincode: pincode ? pincode.trim() : ''
      },
      { new: true, runValidators: false }
    ).select('name email phone address pincode createdAt');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id:        updatedUser._id,
        name:      updatedUser.name      || '',
        email:     updatedUser.email     || '',
        phone:     updatedUser.phone     || '',
        address:   updatedUser.address   || '',
        pincode:   updatedUser.pincode   || '',
        createdAt: updatedUser.createdAt
      }
    });
  } catch (err) {
    console.error('[Profile Update Error]', err.message);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

/**
 * DELETE /api/profile
 * Permanently deletes the authenticated user's account and all related data.
 */
exports.deleteAccount = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const email = user.email;

    // Delete related records then the user
    await Favourite.deleteMany({ user_id: userId });
    await PasswordReset.deleteMany({ email });
    await User.findByIdAndDelete(userId);

    res.json({ success: true, message: 'Account deleted successfully.' });
  } catch (err) {
    console.error('[Delete Account Error]', err.message);
    res.status(500).json({ message: 'Failed to delete account.' });
  }
};
