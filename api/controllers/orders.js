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
	    productIds = []
	    
	    req.body.products.map( product => {
		    Product.find({productId: product.productId}).select('productId quantity')
			    .exec().then(mon_product => {
			    if (!mon_product) {
				    return res.status(404).json({
					    message: 'Product not found'
				    })
			    }
			    if( mon_product.quantity < product.quantity){
				    return res.status(412).json({
					    product: product.productId,
					    message: 'Stock unavailable',
					    stockAvailable: mon_product.quantity
				    })
			    }
			    productIds.push(product.productId)
		    })
	    });
	    
	    const order = new Order({
		    orderId: mongoose.Types.ObjectId(),
		    products: req.body.products
	    })
     
	    order
		    .save()
            .then(result => {
	            Product.find({'productId': productIds})
		            .select('name price soldBy stock productId')
		            .exec()
		            .then(products => {
			            products.map(product1 => {
				            let orderProduct = order.products.filter(orderProduct =>
					            product1['productId'].equals(orderProduct['productId'])
				            )
				            product1.stock -= orderProduct[0]['quantity']
				            product1.save()
			            })
			
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
	            
            })
            .catch(err => {
                res.status(500).json(err)
            })
    }

exports.orders_get_byId = (req, res, next) => {
	Order.aggregate([
			{
				$match: {"orderId": new mongoose.Types.ObjectId(req.params.orderId)}
			},
			{
				$lookup: {
					from: "products",
					localField: "products.productId",
					foreignField: "productId",
					as: "productDetails"
				}
			},
			{
				$project: {
					"_id": 0,
					"orderId": 1,
					"productDetails.productId": 1,
					"productDetails.name": 1,
					"productDetails.price": 1,
					"productDetails.soldBy": 1
				}
			}])
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