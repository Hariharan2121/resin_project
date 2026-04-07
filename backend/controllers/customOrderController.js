const nodemailer = require('nodemailer');

/**
 * POST /api/order/custom
 * Handle custom design studio order requests and send email to admin.
 */
const customOrderHandler = async (req, res) => {
  const {
    productType,
    baseColor,
    inclusions,
    customText,
    textFont,
    textColor,
    shape,
    size,
    finish,
    specialInstructions,
    estimatedPrice,
    userName,
    userEmail
  } = req.body;

  if (!productType || !userEmail) {
    return res.status(400).json({ message: 'Product type and email are required.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: false,
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    });

    const inclusionsList = Array.isArray(inclusions) && inclusions.length > 0
      ? inclusions.join(', ')
      : 'None';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; background: #FBF5EE; }
            .wrap { max-width: 620px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(44,26,14,0.10); }
            .hdr { background: linear-gradient(135deg, #C87941 0%, #8B4513 100%); padding: 36px 32px; text-align: center; }
            .hdr h1 { color: #fff; font-size: 22px; margin: 0; }
            .hdr p { color: rgba(255,255,255,0.80); font-size: 13px; margin: 8px 0 0; }
            .body { padding: 32px; }
            .sec { margin-bottom: 28px; }
            .sec-title { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #C87941; border-bottom: 1px solid #EDD9C0; padding-bottom: 8px; margin-bottom: 14px; }
            .row { display: flex; gap: 8px; margin-bottom: 8px; font-size: 13px; }
            .lbl { font-weight: 600; color: #7A5542; min-width: 150px; flex-shrink: 0; }
            .val { color: #2C1810; }
            .price-box { background: linear-gradient(135deg, #FEF0E3, #FBF5EE); border: 1px solid #EDD9C0; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
            .price-lbl { font-size: 11px; color: #9C7B65; text-transform: uppercase; letter-spacing: 0.08em; }
            .price-val { font-size: 32px; font-weight: 700; color: #C87941; margin-top: 4px; }
            .ft { background: #FBF5EE; padding: 20px 32px; text-align: center; color: #9C7B65; font-size: 12px; border-top: 1px solid #EDD9C0; }
          </style>
        </head>
        <body>
          <div class="wrap">
            <div class="hdr">
              <h1>🎨 Custom Order Request</h1>
              <p>Submitted via RKL Trove Design Studio</p>
            </div>
            <div class="body">
              <div class="sec">
                <div class="sec-title">Customer Details</div>
                <div class="row"><span class="lbl">Name:</span><span class="val">${userName || 'Not provided'}</span></div>
                <div class="row"><span class="lbl">Email:</span><span class="val">${userEmail}</span></div>
              </div>

              <div class="sec">
                <div class="sec-title">Product Customization</div>
                <div class="row"><span class="lbl">Product Type:</span><span class="val">${productType}</span></div>
                <div class="row"><span class="lbl">Base Color:</span><span class="val">${baseColor || 'Not selected'}</span></div>
                <div class="row"><span class="lbl">Shape:</span><span class="val">${shape || 'Not selected'}</span></div>
                <div class="row"><span class="lbl">Size:</span><span class="val">${size || 'Not selected'}</span></div>
                <div class="row"><span class="lbl">Finish:</span><span class="val">${finish || 'Not selected'}</span></div>
              </div>

              <div class="sec">
                <div class="sec-title">Inclusions</div>
                <div class="row"><span class="val">${inclusionsList}</span></div>
              </div>

              <div class="sec">
                <div class="sec-title">Personalisation</div>
                <div class="row"><span class="lbl">Custom Text:</span><span class="val">${customText || 'None'}</span></div>
                <div class="row"><span class="lbl">Font:</span><span class="val">${textFont || 'Not selected'}</span></div>
                <div class="row"><span class="lbl">Text Color:</span><span class="val">${textColor || 'Not selected'}</span></div>
              </div>

              ${specialInstructions ? `
              <div class="sec">
                <div class="sec-title">Special Instructions</div>
                <div class="row"><span class="val">${specialInstructions}</span></div>
              </div>` : ''}

              <div class="price-box">
                <div class="price-lbl">Estimated Price</div>
                <div class="price-val">₹${estimatedPrice || 0}</div>
              </div>
            </div>
            <div class="ft">This custom order was submitted via RKL Trove Design Studio · ${new Date().toLocaleString('en-IN')}</div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"RKL Trove Design Studio" <${process.env.MAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.MAIL_USER,
      subject: `🎨 New Custom Order — ${userName || userEmail} | RKL Trove`,
      html
    });

    res.json({ success: true, message: 'Custom order request sent successfully.' });
  } catch (err) {
    console.error('[Custom Order Error]', err.message);
    res.status(500).json({ message: 'Failed to send custom order. Please try again.' });
  }
};

module.exports = { customOrderHandler };
