const db = require('../config/db');

// ─── Auto-migrate city column on startup ───────────────────────────────────────
(async () => {
  try {
    await db.query('ALTER TABLE users ADD COLUMN city VARCHAR(100) DEFAULT NULL');
    console.log('✅ Migrated: city column added to users table');
  } catch (err) {
    if (err.code !== 'ER_DUP_FIELDNAME') {
      console.error('Migration warning:', err.message);
    }
  }
})();

/**
 * GET /api/profile
 */
exports.getProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, phone, address, city, pincode, created_at FROM users WHERE id = ?',
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error('[Profile Fetch Error]', err.message);
    res.status(500).json({ message: 'Failed to retrieve profile.' });
  }
};

/**
 * PUT /api/profile
 */
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, phone, address, city, pincode } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: 'Name must be at least 2 characters.' });
  }

  try {
    await db.query(
      'UPDATE users SET name = ?, phone = ?, address = ?, city = ?, pincode = ? WHERE id = ?',
      [name.trim(), phone || null, address || null, city || null, pincode || null, userId]
    );

    const [rows] = await db.query(
      'SELECT id, name, email, phone, address, city, pincode FROM users WHERE id = ?',
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: rows[0]
    });
  } catch (err) {
    console.error('[Profile Update Error]', err.message);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
};

/**
 * DELETE /api/profile
 * Permanently deletes the authenticated user's account and all related data.
 */
exports.deleteAccount = async (req, res) => {
  const userId = req.user.id;
  try {
    // Fetch email first for password_resets cleanup
    const [userRows] = await db.query('SELECT email FROM users WHERE id = ?', [userId]);
    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const email = userRows[0].email;

    // Delete related records
    await db.query('DELETE FROM favourites WHERE user_id = ?', [userId]);
    await db.query('DELETE FROM password_resets WHERE email = ?', [email]);
    await db.query('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ success: true, message: 'Account deleted successfully.' });
  } catch (err) {
    console.error('[Delete Account Error]', err.message);
    res.status(500).json({ message: 'Failed to delete account.' });
  }
};
