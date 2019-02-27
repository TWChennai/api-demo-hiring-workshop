const express = require('express')
const router = express.Router()
const checkAuth = require('../middleware/check-auth')
const ProductController = require('../controllers/products')

router.get('/', ProductController.products_get_all)

router.post('/',  ProductController.products_create_product)

router.get('/:productId', ProductController.product_get_product)

router.patch('/:productId',  ProductController.products_update_product)

router.delete('/:productId',  ProductController.products_delete_product)

module.exports = router