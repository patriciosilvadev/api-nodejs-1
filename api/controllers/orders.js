const mongoose = require('mongoose');

const Order = require("../models/order");
const Product = require("../models/product");

exports.orders_get_all = (req, res, next) => {
    Order.find()
    .select("product quantity _id")
        .populate('product', 'name')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        product: doc.product,
                        quantity: doc.quantity,
                        _id: doc._id,
                        request: {
                            type: "GET",
                            url: `http://localhost:3000/orders/${doc._id}`
                        }
                    }
                })
            }
            res.status(200).json(response)
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        })
}

exports.orders_create_order = (req, res, next) => {
    Product.findById(req.body.productId)
        .then(product => {

            if(!product) {
                return res.status(404).json({
                    message: "Product not found"
                })
            }

            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            })
            return order.save()
        })
        .then(result => {
            res.status(201).json({
                message: 'Order stored',
                createdOrder: {
                   _id: result._id,
                   product: result.product,
                   quantity: result.quantity
                },
                request: {
                    type: 'GET',
                    url: `http://localhost:3000/order/${result._id}`
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}

exports.orders_get_order = (req, res, next) => {
    Order.findById(req.params.orderId)
        .populate('product')
        .exec()
        .then(order => {

            if(!order) {
                return res.status(404).json({
                    message: 'Order not found'
                });
            }

            res.status(200).json({
                order: order
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}

exports.orders_delete_order = (req, res, next) => {
    const id = req.params.orderId
    Order.remove({_id: id})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Order deleted'
            })
        })
        .catch(err => {
            res.status(500).json({error: err})
        })
}