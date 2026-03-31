const express = require('express')
const router = express.Router()
const { getProducts, getProductById, seedDatabase } = require('../controllers/productController')

/**
 * Public routes: anyone can view products.
 */
router.get('/', getProducts)
router.get('/:id', getProductById)

/**
 * Admin logic: Reset & Seed database with the full 16-product artisan collection.
 * Use this ONLY for initial setup on Remote/Render.
 */
router.get('/admin/reset-database-seed', seedDatabase)

module.exports = router
