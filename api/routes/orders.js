const express = require('express')
const router = express.Router()
const checkAuth = require('../middleware/check-auth')
const OrdersController = require('../controllers/orders')

router.get('/', OrdersController.orders_get_all)

router.get('/:orderId', OrdersController.orders_get_byId)

router.post('/', OrdersController.orders_create_order)

router.put('/:orderId', OrdersController.orders_update_order)

router.delete('/:orderId', OrdersController.orders_delete_order)

module.exports = router