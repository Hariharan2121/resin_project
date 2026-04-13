const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const User = require('../models/User')
const PasswordReset = require('../models/PasswordReset')

const router = express.Router()
const SALT_ROUNDS = 12
const TOKEN_EXPIRES = '7d'

// ─── Signup ───
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields required.' })
  try {
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) return res.status(409).json({ message: 'Email already exists.' })

    const hashed = await bcrypt.hash(password, SALT_ROUNDS)
    const role = (email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase()) ? 'admin' : 'user'
    const user = new User({ name: name.trim(), email: email.toLowerCase(), password: hashed, role })
    await user.save()

    const payload = { id: user._id.toString(), name: user.name, email: user.email, role: user.role }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRES })
    res.status(201).json({ token, user: payload })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ message: 'Signup failed.' })
  }
})

// ─── Login ───
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ message: 'Invalid credentials.' })

    const payload = { id: user._id.toString(), name: user.name, email: user.email, role: user.role }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRES })
    res.json({ token, user: payload })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Login failed.' })
  }
})

// ─── Forgot Password ───
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body
  try {
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return res.status(404).json({ message: 'Account not found.' })

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await PasswordReset.deleteMany({ email: email.toLowerCase() })
    const reset = new PasswordReset({ email: email.toLowerCase(), otp, expires_at: expiresAt })
    await reset.save()

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: false,
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    })

    await transporter.sendMail({
      from: `"RKL Trove" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'RKL Trove - Recovery Key',
      text: `Your recovery key is: ${otp}`
    })

    res.json({ success: true, message: 'OTP sent.' })
  } catch (err) {
    console.error('Forgot password error:', err)
    res.status(500).json({ message: 'Failed to send OTP.' })
  }
})

// ─── Verify OTP ───
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body
  try {
    const record = await PasswordReset.findOne({
      email: email.toLowerCase(),
      otp,
      used: false
    })
    if (!record) return res.status(400).json({ message: 'Invalid OTP.' })
    if (new Date() > new Date(record.expires_at)) return res.status(400).json({ message: 'OTP expired.' })

    res.json({ success: true })
  } catch (err) {
    console.error('Verify OTP error:', err)
    res.status(500).json({ message: 'Verification failed.' })
  }
})

// ─── Reset Password ───
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body
  try {
    const hashed = await bcrypt.hash(newPassword, 10)
    await User.findOneAndUpdate({ email: email.toLowerCase() }, { password: hashed })
    await PasswordReset.findOneAndUpdate({ email: email.toLowerCase(), otp }, { used: true })
    res.json({ success: true, message: 'Password reset.' })
  } catch (err) {
    console.error('Reset password error:', err)
    res.status(500).json({ message: 'Reset failed.' })
  }
})

module.exports = router
