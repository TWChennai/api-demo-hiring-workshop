'use strict'
var mongodb = require('mongoose')
const Product = require('../api/models/products')

module.exports.up = function (next) {
	const mongoDbURL = process.env.MONGODB_URL || 'mongodb://mongo/api_demo'
	mongodb.connect(mongoDbURL, { useNewUrlParser: true })
		.then(() => {
			let products = [{
				"productId": new mongodb.Types.ObjectId(),
				"name": "TV",
				"price": 35000,
				"soldBy": "Samsung",
				"stock": 50
			}, {
				"productId": new mongodb.Types.ObjectId(),
				"name": "iPhoneX",
				"price": 100000,
				"soldBy": "Apple",
				"stock": 50
			}, {
				"productId": new mongodb.Types.ObjectId(),
				"name": "Washing machine",
				"price": 35000,
				"soldBy": "Whirpool",
				"stock": 20
			}, {
				"productId": new mongodb.Types.ObjectId(),
				"name": "Fridge",
				"price": 20000,
				"soldBy": "LG",
				"stock": 60
			}, {
				"productId": new mongodb.Types.ObjectId(),
				"name": "Laptop",
				"price": 60000,
				"soldBy": "Dell",
				"stock": 100
			}]
			Product.collection.insertMany(products)
			next()
		})
}

module.exports.down = function (next) {
	next()
}
