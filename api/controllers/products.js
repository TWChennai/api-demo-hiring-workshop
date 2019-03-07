const Product = require('../models/products')
const mongoose = require('mongoose')

exports.products_get_all = (req, res, next) => {
    Product.find()
    .select('name price soldBy stock productId')
    .exec()
    .then(docs =>{
        const respone = {
            count: docs.length,
            products: docs.map( doc=>{
                return {
                    name: doc.name,
                    price: doc.price,
                    soldBy: doc.soldBy,
                    stock: doc.stock,
	                productId: doc.productId,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/'+doc.productId
                    }
                }
            })
        }
        res.status(200).json(respone)
    }).catch(err => {
        console.log(err)
        res.status(500).json({
            error: err 
        })
    })
}

exports.products_create_product = (req, res, next) => {
    const product = new Product({
	    productId: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        soldBy: req.body.soldBy,
        stock: req.body.stock
    })
    product.save().then(result => {
        console.log(result)
        res.status(201).json({
            message: "Created product successfully",
            createdProduct: {
                name: result.name,
                price: result.price,
	            soldBy: result.soldBy,
	            stock: result.stock,
	            productId: result.productId,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/'+result.productId
                }
            }
        })
    }).catch(err => {
        console.log(err)
        res.status(500).json({error: err})
    })  
}

exports.product_get_product = (req, res, next) => {
    const id = req.params.productId
    Product.find({productId: id})
    .select('productId name price soldBy stock')
    .exec()
    .then(doc => {
        console.log(doc)
        if(doc) {
            res.status(200)
            .json(doc)
        } else {
            res.status(404).json({
                message: "No valid entry found"
            })
        }
        
    }).catch( err => {
        console.log(err)
        res.status(500)
        .json({error: err })
    })
}

exports.products_update_product =  (req, res, next) => {
    const id = req.params.productId
    const updateOps = {}
    for(const ops of req.body) {
        updateOps[Object.keys(ops)[0]] = ops[Object.keys(ops)[0]]
    }
    Product.update({productId: id}, { $set: updateOps })
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Product updated',
            request: {
                type: 'GET',
                url: 'http://localhost:3000/products/'+id
            }
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
}

exports.products_delete_product = (req, res, next) => {
    const id = req.params.productId
    Product.remove({ productId: id})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Product deleted',
            type: 'POST',
            url: 'http://localhost:3000/products',
            body: { name: 'String', price: 'Number '}
        })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
}