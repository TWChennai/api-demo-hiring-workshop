const Order = require('../models/orders')
const Product = require('../models/products')
const mongoose = require('mongoose')

exports.orders_get_all = (req, res, next) => {
	Order.aggregate([{
			$lookup: {
				from: "products",
				localField: "products.productId",
				foreignField: "productId",
				as: "productDetails"
			}
		},
			{
				$project: {
					"orderId": 1,
					"productDetails.productId": 1,
					"productDetails.name": 1,
					"productDetails.price": 1,
					"productDetails.soldBy": 1
				}
			}])
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
	                    orderId: doc.orderId,
	                    products: doc.productDetails,
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
	    let productIds = []
	    let productDict = {}
	    req.body.products.map( product => {
		    if( !productIds.includes(product.productId)) {
			    productIds.push(product.productId)
		    }
		    productDict[product.productId] = product.quantity
	    });
	
	    Product.find({productId: productIds})
		    .select('name price soldBy stock productId')
		    .exec()
		    .then(products => {
			    if (products.length < productIds.length) {
				    throw  {
					    code: 404,
					    message: "Product not found"
				    }
			    }
			    products.map(product => {
				    if (product.stock < productDict[product.productId]) {
					    throw  {
						    code: 412,
						    message: {
							    product: product.productId,
							    message: 'Stock unavailable, Order only how much is available',
							    stockAvailable: product.stock
						    }
					    }
				    }
			    })
			    return products
		    }).then(products => {
			    const order = new Order({
				    orderId: mongoose.Types.ObjectId(),
				    products: req.body.products
			    })
			    order
				    .save()
				    .then(result => {
					    products.map(product1 => {
						    let orderProduct = order.products.filter(orderProduct =>
							    product1['productId'].equals(orderProduct['productId'])
						    )
						    product1.stock -= orderProduct[0]['quantity']
						    product1.save()
					    })
					
					    return res.status(201).json({
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
		    })
		    .catch((err) => {
			    return res.status(err.code).json(err.message)
		    })
	
    }

exports.orders_get_byId = (req, res, next) => {
	Order.find({"orderId": new mongoose.Types.ObjectId(req.params.orderId)})
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
	let productIds = []
	let productDict = {}
	req.body.products.map(product => {
		if( !productIds.includes(product.productId)) {
			productIds.push(product.productId)
		}
		productDict[product.productId] = product.quantity
	});
	
	Order.find({orderId: req.params.orderId}).select('orderId products').exec().then(order => {
		if (!order) {
			return res.status(404).json({
				message: 'Order not found'
			})
		}
		return order[0]
	}).then(order => {
		Product.find({productId: productIds})
			.select('name price soldBy stock productId')
			.exec()
			.then(products => {
				if (products.length < productIds.length) {
					throw  {
						code: 404,
						message: "Product not found"
					}
				}
				for(let i = 0; i< products.length; i++){
					let productInOrder = order.products.filter(orderProduct => products[i]['productId'].equals(orderProduct['productId']))
					let orderProductQuantity = 0
					if (productInOrder.length > 0) {
						orderProductQuantity = productInOrder[0].quantity
					}
					if (products[i].stock + orderProductQuantity < productDict[products[i].productId]) {
						throw  {
							code: 412,
							message: {
								product: products[i].productId,
								message: 'Stock unavailable, Order only how much is available',
								stockAvailable: products[i].stock
							}
						}
					}
				}
				return products
			}).then((products) => {
				req.body.products.map(product => {
					let productInOrder = order.products.filter(orderProduct => orderProduct['productId'].equals(product['productId']))
					let masterProduct = products.filter(orderProduct => orderProduct['productId'].equals(product['productId']))
					if (productInOrder.length > 0) {
						masterProduct[0].stock = productInOrder[0].quantity + masterProduct[0].stock - product.quantity
						productInOrder[0].quantity =  product.quantity
					} else {
						order.products.push(product)
						masterProduct[0].stock = masterProduct[0].stock - product.quantity
					}
				})
			products.map(product => product.save())
			return order
			}
		).then(order => order.save().then(
			res.status(200).json({
				order,
				request: {
					type: 'GET',
					url: 'http://localhost:3000/orders'
				}
			}))).catch(err => {
			res.status(500).json(err)
		})
	}).catch(err => {
		res.status(500).json(err)
	})
	
}