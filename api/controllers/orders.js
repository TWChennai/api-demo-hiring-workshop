const Order = require('../models/orders')
const Product = require('../models/products')
const mongoose = require('mongoose')

exports.orders_get_all = (req, res, next) => {
    Order.find()
        .select('products orderId')
        .populate({
	        path: 'products.productId',
	        model: 'Product'})
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
	                    orderId: doc.orderId,
                        products: doc.products,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders/' + doc.orderId
                        }
                    }
                }),
            })
        })
        .catch(err => {
            res.status(500).json(err)
        })
},

    exports.orders_create_order = (req, res, next) => {
	    req.body.products.map( product => {
          product = Product.find({productId: product.productId})
                if (!product) {
                    return res.status(404).json({
                        message: 'Product not found'
                    })
                }
            });
	    const order = new Order({
		    orderId: mongoose.Types.ObjectId(),
		    products: req.body.products
	    })
        order
		    .save()
            .then(result => {
                res.status(201).json({
                    message: 'Order stored',
                    createdOrder: {
                        orderId: result.orderId,
                        products: result.products,
                    },
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/orders/' + result.orderId
                    }
                })
            })
            .catch(err => {
                res.status(500).json(err)
            })
    }
exports.orders_get_byId = (req, res, next) => {
    Order.find({orderId: req.params.orderId})
        .select('products orderId')
        .populate({
	        path: 'products.productId',
	        model: 'Product'})
        .exec()
        .then(order => {
            if (!order) {
                return res.status(404).json({
                    message: 'order not found'
                })
            }
            res.status(200).json({
                order,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders'
                }
            })
        })
        .catch(err => {
            res.status(500).json(err)
        })
}

exports.orders_delete_order = (req, res, next) => {
    Order.remove({ orderId: req.params.orderId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'order deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/orders',
                    body: { productId: 'ID', quantity: 'Number' }
                }
            })
        })
        .catch(err => {
            res.status(500).json(err)
        })
}

exports.orders_update_order = (req, res, next) => {
	Order.find({orderId: req.params.orderId}).then(order => {
		if (!order) {
			return res.status(404).json({
				message: 'order not found'
			})
		}
		return order
	}).then(order => {
			req.body.products.map(product => {
				let mon_product = Product.find({productId: product['productId']})
				if (!mon_product) {
					return res.status(404).json({
						message: 'Product not found'
					})
				}
				let count = order.products.filter(orderProduct => product['productId'] == orderProduct['productId'])
				if (count.length > 0) {
					let ref_product = order.products.find(orderProduct => product['productId'] == orderProduct['productId'])
					ref_product.quantity = ref_product.quantity + product.quantity
				} else {
					order.products.append(product)
				}
				
			})
			return order
		}
	).then(order => order.save().then(
		res.status(200).json({
			order,
			request: {
				type: 'GET',
				url: 'http://localhost:3000/orders'
			}
		})))
}