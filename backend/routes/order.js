const express = require('express')
const router = express.Router()
const { sendOrderEmail } = require('../services/email')

/**
 * POST /api/order
 */
router.post('/', async (req, res) => {
  const { cart, total, userDetails } = req.body

  if (!cart || !userDetails) {
    return res.status(400).json({ message: 'Order data missing.' })
  }

  try {
    // Orders are currently just e-mailed to the admin.
    const sent = await sendOrderEmail(userDetails, cart, total)
    if (sent) {
      res.json({ message: 'Order placed successfully! We will contact you soon.' })
    } else {
      res.status(500).json({ message: 'Failed to notify admin about the order.' })
    }
  } catch (err) {
    console.error('[Order Error]', err)
    res.status(500).json({ message: 'Internal server error.' })
  }
})

module.exports = router
