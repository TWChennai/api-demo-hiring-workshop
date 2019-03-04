const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    productId: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true},
    price: { type: Number, required: true},
    soldBy:{ type: String, required: true},
    stock: { type: Number, required: true}
})

module.exports = mongoose.model('Product',productSchema)