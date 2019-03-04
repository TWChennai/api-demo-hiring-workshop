'use strict'
var mongodb = require('mongoose')
const Product = require('../api/models/products')

module.exports.up = function (next) {
	mongodb.connect('mongodb://localhost/api_demo', {useNewUrlParser: true})
		.then(() => {
			let products = [{
				"name": "TV",
				"price": 35000,
				"soldBy": "Samsung",
				"stock": 50
			}, {
				"name": "iPhoneX",
				"price": 100000,
				"soldBy": "Apple",
				"stock": 50
			}, {
				"name": "Washing machine",
				"price": 35000,
				"soldBy": "Whirpool",
				"stock": 20
			}, {
				"name": "Fridge",
				"price": 20000,
				"soldBy": "LG",
				"stock": 60
			}, {
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
