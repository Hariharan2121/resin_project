const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer')

/**
 * POST /api/order
 */
router.post('/', async (req, res) => {
  const { cart, total, userDetails } = req.body

  if (!cart || !userDetails) {
    return res.status(400).json({ message: 'Order data missing.' })
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    })

    const cartHtml = (cart || []).map(item => `
      <li>${item.name} x ${item.quantity} - ₹${item.price * item.quantity}</li>
    `).join('')

    await transporter.sendMail({
      from: `"RKL Trove Order" <${process.env.MAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.MAIL_USER,
      subject: 'New Order Received - RKL Trove',
      html: `
        <h2>New Order from ${userDetails.name}</h2>
        <p>Email: ${userDetails.email}</p>
        <p>Total: ₹${total}</p>
        <ul>${cartHtml}</ul>
      `
    })

    res.json({ message: 'Order placed successfully! We will contact you soon.' })
  } catch (err) {
    console.error('[Order Error Detailed]', {
      message: err.message,
      code: err.code,
      command: err.command,
      stack: err.stack
    })
    res.status(500).json({ 
      message: 'Order submitted but email notification failed.',
      debug: err.message // Temporarily include error message for easier debugging
    })
  }
})

module.exports = router
