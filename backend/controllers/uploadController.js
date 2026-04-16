const multer = require('multer');
const XLSX = require('xlsx');
const Product = require('../models/Product');

/**
 * Multer Configuration
 * Using memory storage to avoid disk I/O.
 */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMime = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/octet-stream',
    'application/excel',
    'application/x-excel',
    'application/x-msexcel'
  ];

  const extension = file.originalname.split('.').pop().toLowerCase();
  const isExcelExt = ['xlsx', 'xls'].includes(extension);

  if (allowedMime.includes(file.mimetype) || isExcelExt) {
    cb(null, true);
  } else {
    cb(new Error('Only .xlsx and .xls files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadMiddleware = upload.single('file');

/**
 * Main Upload Handler
 */
const uploadProducts = async (req, res) => {
  // STEP 1 — Check file exists
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    // STEP 2 — Parse Excel buffer to JSON
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: ''
    });

    if (rawRows.length < 2) {
      return res.status(400).json({ success: false, message: 'Excel file is empty or missing data rows' });
    }

    // STEP 3 — Extract headers from Row 0
    const headers = rawRows[0].map(h => String(h).trim().toLowerCase());

    const nameIdx        = headers.indexOf('name');
    const priceIdx       = headers.indexOf('price');
    const imageUrlIdx    = headers.indexOf('image_url');
    const descriptionIdx = headers.indexOf('description');
    const isAvailableIdx = headers.indexOf('is_available');

    if (nameIdx === -1 || priceIdx === -1) {
      return res.status(400).json({
        success: false,
        message: 'Excel file must have columns: name, price'
      });
    }

    // STEP 4 — Map data rows to objects
    const dataRows = rawRows.slice(1);
    const products = [];
    const errors   = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      if (!row || row.length === 0) continue;

      const name = String(row[nameIdx] || '').trim();
      if (!name) continue;

      const priceRaw = row[priceIdx];
      const price    = parseFloat(priceRaw);

      if (isNaN(price) || price < 0) {
        errors.push({ name, reason: `Invalid price value: ${priceRaw}` });
        continue;
      }

      const image_url = imageUrlIdx !== -1
        ? String(row[imageUrlIdx] || '').trim() || null
        : null;
      const description = descriptionIdx !== -1
        ? String(row[descriptionIdx] || '').trim() || null
        : null;

      // PARSE IS_AVAILABLE
      const isAvailableRaw = isAvailableIdx !== -1
        ? String(row[isAvailableIdx] || '').trim().toLowerCase()
        : '';
      const is_available = !['false', 'no', '0', 'unavailable'].includes(isAvailableRaw);

      products.push({ name, price, image_url, description, is_available });
    }

    if (products.length === 0 && errors.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid product rows found in the Excel file' });
    }

    // STEP 5 — Upsert each product into MongoDB
    let inserted = 0;
    let updated  = 0;

    for (const product of products) {
      try {
        const exists = await Product.findOne({ name: product.name });
        await Product.findOneAndUpdate(
          { name: product.name },
          { 
            name: product.name, 
            price: product.price, 
            image_url: product.image_url, 
            description: product.description,
            is_available: product.is_available
          },
          { upsert: true, new: true, runValidators: true }
        );
        if (exists) {
          updated++;
        } else {
          inserted++;
        }
      } catch (err) {
        errors.push({ name: product.name, reason: err.message });
      }
    }

    // STEP 6 — Return result summary
    res.json({
      success: true,
      message: 'Upload complete',
      summary: {
        total:        products.length + errors.length,
        inserted,
        updated,
        errors:       errors.length,
        errorDetails: errors
      }
    });

  } catch (err) {
    console.error('[Excel Upload Error]', err);
    res.status(500).json({ success: false, message: 'Failed to process Excel file', error: err.message });
  }
};

module.exports = {
  uploadMiddleware,
  uploadProducts
};
