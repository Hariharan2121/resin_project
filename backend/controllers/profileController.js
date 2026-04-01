const db = require('../config/db');

/**
 * GET /api/profile
 */
exports.getProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, phone, address, pincode, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error('[Profile Fetch Error Detailed]', {
      message: err.message,
      code: err.code,
      stack: err.stack
    })
    res.status(500).json({ message: 'Failed to retrieve profile.', debug: err.message });
  }
};

/**
 * PUT /api/profile
 */
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, phone, address, pincode } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: 'Name must be at least 2 characters.' });
  }

  try {
    await db.query(
      'UPDATE users SET name = ?, phone = ?, address = ?, pincode = ? WHERE id = ?',
      [name.trim(), phone || null, address || null, pincode || null, userId]
    );

    const [rows] = await db.query(
      'SELECT id, name, email, phone, address, pincode FROM users WHERE id = ?',
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: rows[0]
    });
  } catch (err) {
    console.error('[Profile Update Error Detailed]', {
      message: err.message,
      code: err.code,
      stack: err.stack
    })
    res.status(500).json({ message: 'Failed to update profile.', debug: err.message });
  }
};
