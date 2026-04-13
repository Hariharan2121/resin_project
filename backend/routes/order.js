const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer')
const Order = require('../models/Order')
const { customOrderHandler } = require('../controllers/customOrderController')

/**
 * POST /api/order
 * Standard cart order — saves to MongoDB then sends email to admin.
 */
router.post('/', async (req, res) => {
  const { cart, total, userDetails } = req.body

  if (!cart || !userDetails) {
    return res.status(400).json({ message: 'Order data missing.' })
  }

  try {
    // Save order to MongoDB
    const items = (cart || []).map(item => ({
      name:     item.name,
      price:    item.price,
      quantity: item.quantity || 1
    }))

    const order = new Order({
      user_id:    req.user?.id || null,
      userName:   userDetails.name  || 'Guest',
      userEmail:  userDetails.email || '',
      items,
      totalPrice: parseFloat(total) || 0
    })
    await order.save()

    // Send email notification to admin
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    })

    const cartHtml = items.map(item =>
      `<li>${item.name} x ${item.quantity} - ₹${item.price * item.quantity}</li>`
    ).join('')

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
    console.error('[Order Error]', err.message)
    res.status(500).json({
      message: 'Order submitted but email notification failed.',
      debug: err.message
    })
  }
})

const authMiddleware = require('../middleware/authMiddleware')

/**
 * GET /api/order/mine
 * Fetch order history for the authenticated user.
 */
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    console.error('[Order History Error]', err);
    res.status(500).json({ message: 'Failed to fetch order history.' });
  }
});

/**
 * GET /api/order/admin/all
 * Fetch all orders for admin review.
 */
router.get('/admin/all', authMiddleware, async (req, res) => {
  if (req.user.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({ message: 'Access denied: Admin only.' });
  }
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    console.error('[Admin Orders Error]', err);
    res.status(500).json({ message: 'Failed to fetch all orders.' });
  }
});

/**
 * PATCH /api/order/:id/status
 * Update order status (Admin only).
 */
router.patch('/:id/status', authMiddleware, async (req, res) => {
  if (req.user.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({ message: 'Access denied: Admin only.' });
  }
  const { status } = req.body;
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ success: true, data: order });
  } catch (err) {
    console.error('[Update Order Status Error]', err);
    res.status(500).json({ message: 'Failed to update order status.' });
  }
});

/**
 * POST /api/order/custom
 * Custom design studio order — sends detailed email to admin.
 */
router.post('/custom', customOrderHandler)

module.exports = router
