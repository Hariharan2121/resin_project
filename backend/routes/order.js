const express = require('express')
const nodemailer = require('nodemailer')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

/**
 * Build a rich HTML email for the admin with order details.
 */
function buildOrderEmailHtml({ customerName, customerEmail, items, totalAmount, orderDate }) {
  const rows = items.map(item => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #f5ead6;font-size:14px;color:#44403c;">${item.name}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f5ead6;text-align:center;font-size:14px;color:#44403c;">${item.quantity}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f5ead6;text-align:right;font-size:14px;color:#e11d48;font-weight:600;">
        ₹${Number(item.price).toLocaleString('en-IN')}
      </td>
      <td style="padding:10px 14px;border-bottom:1px solid #f5ead6;text-align:right;font-size:14px;font-weight:600;color:#44403c;">
        ₹${(Number(item.price) * item.quantity).toLocaleString('en-IN')}
      </td>
    </tr>`).join('')

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:'Inter',Arial,sans-serif;background:#fdf8f3;margin:0;padding:32px 16px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#fb7185,#fda4af);padding:32px 32px 24px;">
      <h1 style="margin:0;color:#fff;font-size:28px;letter-spacing:-0.5px;">🎁 New Order Received</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">RKL Trove — Order Notification</p>
    </div>

    <!-- Customer Info -->
    <div style="padding:28px 32px 0;">
      <h2 style="margin:0 0 14px;font-size:16px;color:#9f1239;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Customer Details</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#57534e;width:120px;">Name</td>
          <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1c1917;">${customerName}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#57534e;">Email</td>
          <td style="padding:6px 0;font-size:14px;font-weight:600;color:#1c1917;">
            <a href="mailto:${customerEmail}" style="color:#e11d48;">${customerEmail}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#57534e;">Order Date</td>
          <td style="padding:6px 0;font-size:14px;color:#1c1917;">${orderDate}</td>
        </tr>
      </table>
    </div>

    <!-- Items Table -->
    <div style="padding:24px 32px 0;">
      <h2 style="margin:0 0 14px;font-size:16px;color:#9f1239;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Ordered Items</h2>
      <table style="width:100%;border-collapse:collapse;border-radius:10px;overflow:hidden;">
        <thead>
          <tr style="background:#fff1f2;">
            <th style="padding:10px 14px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#9f1239;">Product</th>
            <th style="padding:10px 14px;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#9f1239;">Qty</th>
            <th style="padding:10px 14px;text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#9f1239;">Unit Price</th>
            <th style="padding:10px 14px;text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#9f1239;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr style="background:#fff1f2;">
            <td colspan="3" style="padding:14px;font-weight:700;font-size:15px;color:#1c1917;">TOTAL</td>
            <td style="padding:14px;text-align:right;font-weight:700;font-size:18px;color:#e11d48;">₹${Number(totalAmount).toLocaleString('en-IN')}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Footer -->
    <div style="padding:28px 32px;text-align:center;color:#a8a29e;font-size:13px;">
      <p style="margin:0;">Please contact the customer to confirm delivery details.</p>
      <p style="margin:8px 0 0;">— RKL Trove Admin System</p>
    </div>
  </div>
</body>
</html>`
}

/**
 * POST /api/order  (Protected — requires valid JWT)
 * Body: { customerName, customerEmail, items: [{name, price, quantity}], totalAmount }
 * Sends a formatted order notification email to the admin.
 */
router.post('/', authMiddleware, async (req, res) => {
  const { customerName, customerEmail, items, totalAmount } = req.body

  // Validate request
  if (!customerName || !customerEmail || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Invalid order data.' })
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: false, // TLS
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    })

    const orderDate = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'long',
      timeStyle: 'short',
    })

    const html = buildOrderEmailHtml({ customerName, customerEmail, items, totalAmount, orderDate })

    await transporter.sendMail({
      from: `"RKL Trove Shop" <${process.env.MAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🛍️ New Order from ${customerName} — ₹${Number(totalAmount).toLocaleString('en-IN')}`,
      html,
    })

    console.log(`[Order] Email sent for order by ${customerName} (${customerEmail}) - ₹${totalAmount}`)
    res.json({ message: 'Order placed successfully! Admin has been notified.' })
  } catch (err) {
    console.error('[Order Error]', err)
    res.status(500).json({ message: 'Failed to process order. Please try again.' })
  }
})

module.exports = router
