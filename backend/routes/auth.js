const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const pool = require('../db')

const router = express.Router()
const SALT_ROUNDS = 12
const TOKEN_EXPIRES = '7d'

// ─── Signup ───
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields required.' })
  try {
    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])
    if (existing.length > 0) return res.status(409).json({ message: 'Email already exists.' })
    const hashed = await bcrypt.hash(password, SALT_ROUNDS)
    const result = await pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id', [name.trim(), email.toLowerCase(), hashed])
    const user = { id: result.rows[0].id, name: name.trim(), email: email.toLowerCase() }
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRES })
    res.status(201).json({ token, user })
  } catch (err) { res.status(500).json({ message: 'Signup failed.' }) }
})

// ─── Login ───
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()])
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials.' })
    const match = await bcrypt.compare(password, rows[0].password)
    if (!match) return res.status(401).json({ message: 'Invalid credentials.' })
    const user = { id: rows[0].id, name: rows[0].name, email: rows[0].email }
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRES })
    res.json({ token, user })
  } catch (err) { res.status(500).json({ message: 'Login failed.' }) }
})

// ─── Forgot Password ───
router.post('/auth/forgot-password', async (req, res) => {
  const { email } = req.body
  try {
    const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])
    if (rows.length === 0) return res.status(404).json({ message: 'Account not found.' })
    const otp = String(Math.floor(100000 + Math.random() * 900000))
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    await pool.query('DELETE FROM password_resets WHERE email = $1 AND used = FALSE', [email.toLowerCase()])
    await pool.query('INSERT INTO password_resets (email, otp, expires_at) VALUES ($1, $2, $3)', [email.toLowerCase(), otp, expiresAt])
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: false,
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    })
    await transporter.sendMail({ from: `"RKL Trove" <${process.env.MAIL_USER}>`, to: email, subject: 'RKL Trove - OTP', text: `Your OTP is: ${otp}` })
    res.json({ success: true, message: 'OTP sent.' })
  } catch (err) { res.status(500).json({ message: 'Failed to send OTP.' }) }
})

// ─── Verify OTP ───
router.post('/auth/verify-otp', async (req, res) => {
  const { email, otp } = req.body
  try {
    const { rows } = await pool.query('SELECT * FROM password_resets WHERE email = $1 AND otp = $2 AND used = FALSE ORDER BY created_at DESC LIMIT 1', [email.toLowerCase(), otp])
    if (rows.length === 0) return res.status(400).json({ message: 'Invalid OTP.' })
    if (new Date() > new Date(rows[0].expires_at)) return res.status(400).json({ message: 'OTP expired.' })
    res.json({ success: true })
  } catch (err) { res.status(500).json({ message: 'Verification failed.' }) }
})

// ─── Reset Password ───
router.post('/auth/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body
  try {
    const hashed = await bcrypt.hash(newPassword, 10)
    await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashed, email.toLowerCase()])
    await pool.query('UPDATE password_resets SET used = TRUE WHERE email = $1 AND otp = $2', [email.toLowerCase(), otp])
    res.json({ success: true, message: 'Password reset.' })
  } catch (err) { res.status(500).json({ message: 'Reset failed.' }) }
})

module.exports = router
