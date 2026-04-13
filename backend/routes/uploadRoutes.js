const express = require('express');
const { uploadMiddleware, uploadProducts } = require('../controllers/uploadController');

const router = express.Router();

/**
 * POST /api/upload/products
 * Using a wrapper to handle Multer errors gracefully (like file size or type)
 */
router.post('/', (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error'
      });
    }
    next();
  });
}, uploadProducts);

module.exports = router;
