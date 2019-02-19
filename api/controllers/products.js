const Product = require('../models/products')
const mongoose = require('mongoose')

exports.products_get_all = (req, res, next) => {
    Product.find()
    .select('name price _id')
    .exec()
    .then(docs =>{
        const respone = {
            count: docs.length,
            products: docs.map( doc=>{
                return {
                    name: doc.name,
                    price: doc.price,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/'+doc._id
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
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    })
    product.save().then(result => {
        console.log(result)
        res.status(201).json({
            message: "Created product successfully",
            createdProduct: {
                name: result.name,
                price: result.price,
                _id: result._id,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/'+result._id
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
    Product.findById(id)
    .select('name price id')
    .exec()
    .then(doc => {
        console.log(doc)
        if(doc) {
            res.status(200)
            .json(doc)
        } else {
            res.status(404).json({
                message: "no valid entry found"
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
        updateOps[ops.propsName] = ops.value
    }
    Product.update({_id: id}, { $set: updateOps })
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'product Updated',
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
    Product.remove({ _id: id})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'product deleted',
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