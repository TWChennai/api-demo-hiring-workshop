const Order = require('../models/orders')
const Product = require('../models/products')
const mongoose = require('mongoose')

exports.orders_get_all = (req, res, next) => {
    Order.find()
        .select('products _id')
        .populate('product')
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        products: doc.products,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders/' + doc._id
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
	    req.body.products.map( product => {Product.findById(product.id)
            .then(product => {
                if (!product) {
                    return res.status(404).json({
                        message: 'Product not found'
                    })
                }
            })});
	    const order = new Order({
		    _id: mongoose.Types.ObjectId(),
		    products: req.body.products
	    })
        order
		    .save()
            .then(result => {
                res.status(201).json({
                    message: 'Order stored',
                    createdOrder: {
                        _id: result._id,
                        products: result.products,
                    },
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/orders/' + result._id
                    }
                })
            })
            .catch(err => {
                res.status(500).json(err)
            })
    }
exports.orders_get_byId = (req, res, next) => {
    Order.findById(req.params.orderId)
        .select('products _id')
        .populate('product')
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
    Order.remove({ _id: req.params.orderId })
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
	Order.findById(req.params.orderId).then(order => {
		if (!order) {
			return res.status(404).json({
				message: 'order not found'
			})
		}
		req.body.products.map( id => {Product.findById(id)
			.then(product => {
				if (!product) {
					return res.status(404).json({
						message: 'Product not found'
					})
				}
				
			})});
		order.product.push(req.body.products)
		order.save()
		res.status(200).json({
			order,
			request: {
				type: 'GET',
				url: 'http://localhost:3000/orders'
			}
		})
	})
}