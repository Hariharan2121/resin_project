const express = require('express')
const router = express.Router()
const { getProducts, getProductById } = require('../controllers/productController')

/**
 * Public routes: anyone can view products.
 * These do NOT require authentication middleware.
 */
router.get('/', getProducts)
router.get('/:id', getProductById)

module.exports = router
