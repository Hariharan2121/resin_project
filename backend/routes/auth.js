const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const pool = require('../db')

const router = express.Router()
const SALT_ROUNDS = 12
const TOKEN_EXPIRES = '7d'

/**
 * POST /api/signup
 * Body: { name, email, password }
 * Creates a new user and returns a JWT + user info.
 */
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields (name, email, password) are required.' })
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' })
  }

  try {
    // Check if email already exists
    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])
    if (existing.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    // Hash password and insert user
    const hashed = await bcrypt.hash(password, SALT_ROUNDS)
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
      [name.trim(), email.toLowerCase(), hashed]
    )

    const user = { id: result.rows[0].id, name: name.trim(), email: email.toLowerCase() }
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRES })

    res.status(201).json({ token, user })
  } catch (err) {
    console.error('[Signup Error]', err)
    res.status(500).json({ message: 'Internal server error. Please try again.' })
  }
})

/**
 * POST /api/login
 * Body: { email, password }
 * Returns a JWT + user info on successful authentication.
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()])
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const dbUser = rows[0]
    const passwordMatch = await bcrypt.compare(password, dbUser.password)
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const user = { id: dbUser.id, name: dbUser.name, email: dbUser.email }
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRES })

    res.json({ token, user })
  } catch (err) {
    console.error('[Login Error]', err)
    res.status(500).json({ message: 'Internal server error. Please try again.' })
  }
})

// ─── Forgot Password ─────────────────────────────────────────────────────────

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 * Generates a 6-digit OTP, stores it, and emails it to the user.
 */
router.post('/auth/forgot-password', async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ success: false, message: 'Email is required.' })

  try {
    const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No account found with this email.' })
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await pool.query('DELETE FROM password_resets WHERE email = $1 AND used = 0', [email.toLowerCase()])
    await pool.query(
      'INSERT INTO password_resets (email, otp, expires_at, used) VALUES ($1, $2, $3, 0)',
      [email.toLowerCase(), otp, expiresAt]
    )

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: false,
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    })

    await transporter.sendMail({
      from: `"RKL Trove" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'RKL Trove - Password Reset OTP',
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;border-radius:16px;overflow:hidden;border:1px solid #f0e4d4">
          <div style="background:#C87941;padding:28px 32px;text-align:center">
            <h2 style="color:#fff;margin:0;font-size:22px;font-weight:700">Password Reset Request</h2>
            <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:13px">RKL Trove</p>
          </div>
          <div style="background:#FDF6EC;padding:32px">
            <p style="color:#2C1A0E;font-size:15px;margin:0 0 20px">Your OTP for password reset is:</p>
            <div style="background:#fff;border:2px dashed #C87941;border-radius:12px;padding:20px;text-align:center;margin-bottom:20px">
              <span style="font-size:40px;font-weight:800;letter-spacing:12px;color:#C87941">${otp}</span>
            </div>
            <p style="color:#7a5c42;font-size:13px;margin:0 0 8px">⏱ This OTP is valid for <strong>10 minutes</strong> only.</p>
            <p style="color:#7a5c42;font-size:13px;margin:0">If you did not request this, please ignore this email.</p>
          </div>
          <div style="background:#f5ead6;padding:16px 32px;text-align:center">
            <p style="color:#a0785a;font-size:12px;margin:0">© ${new Date().getFullYear()} RKL Trove. Crafted with ♥</p>
          </div>
        </div>
      `,
    })

    return res.json({ success: true, message: 'OTP sent to your email.' })
  } catch (err) {
    console.error('[Forgot Password Error]', err)
    res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' })
  }
})

/**
 * POST /api/auth/verify-otp
 * Body: { email, otp }
 * Verifies the OTP without marking it used (password not reset yet).
 */
router.post('/auth/verify-otp', async (req, res) => {
  const { email, otp } = req.body
  if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP are required.' })

  try {
    const [rows] = await pool.query(
      'SELECT * FROM password_resets WHERE email = ? AND otp = ? AND used = 0 ORDER BY created_at DESC LIMIT 1',
      [email.toLowerCase(), otp]
    )
    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' })
    }

    const record = rows[0]
    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' })
    }

    return res.json({ success: true, message: 'OTP verified.' })
  } catch (err) {
    console.error('[Verify OTP Error]', err)
    res.status(500).json({ success: false, message: 'Internal server error. Please try again.' })
  }
})

/**
 * POST /api/auth/reset-password
 * Body: { email, otp, newPassword }
 * Re-verifies OTP, then updates the user password.
 */
router.post('/auth/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required.' })
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' })
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM password_resets WHERE email = ? AND otp = ? AND used = 0 ORDER BY created_at DESC LIMIT 1',
      [email.toLowerCase(), otp]
    )
    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or already used OTP.' })
    }
    if (new Date() > new Date(rows[0].expires_at)) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' })
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashed, email.toLowerCase()])
    await pool.query(
      'UPDATE password_resets SET used = 1 WHERE email = ? AND otp = ?',
      [email.toLowerCase(), otp]
    )

    return res.json({ success: true, message: 'Password reset successfully.' })
  } catch (err) {
    console.error('[Reset Password Error]', err)
    res.status(500).json({ success: false, message: 'Internal server error. Please try again.' })
  }
})

module.exports = router
